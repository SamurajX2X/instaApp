<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { apiService } from '$lib/services/api';
	import { addPost } from '$lib/stores/app';

	const dispatch = createEventDispatcher();

	let { showModal = $bindable() }: { showModal: boolean } = $props();
	let files: FileList | null = null;
	let caption = $state('');
	let album = $state('');
	let isUploading = $state(false);
	let dragActive = $state(false);
	let previewUrl: string | null = $state(null);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			files = target.files;
			createPreview();
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;

		if (event.dataTransfer?.files) {
			files = event.dataTransfer.files;
			createPreview();
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	function createPreview() {
		if (files && files[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(files[0]);
		}
	}

	async function handleUpload() {
		if (!files || files.length === 0) return;

		isUploading = true;

		try {
			const formData = new FormData();
			formData.append('photo', files[0]);
			formData.append('caption', caption);
			formData.append('album', album || 'default');

			const response = await apiService.uploadPhoto(formData);

			if (response.success) {
				// Add to store (you might want to get the actual response data)
				const newPost = {
					id: Date.now(),
					username: 'john_doe', // Get from user store
					avatar:
						'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
					image: previewUrl || '',
					caption,
					likes: 0,
					timeAgo: 'now'
				};

				addPost(newPost);
				closeModal();
			} else {
				alert('Upload failed: ' + response.error);
			}
		} catch (error) {
			console.error('Upload error:', error);
			alert('Upload failed');
		} finally {
			isUploading = false;
		}
	}

	function closeModal() {
		showModal = false;
		files = null;
		caption = '';
		album = '';
		previewUrl = null;
		dispatch('close');
	}
</script>

{#if showModal}
	<!-- Modal Backdrop -->
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-200 p-4">
				<h2 class="text-lg font-semibold">Upload New Photo</h2>
				<button onclick={closeModal} class="text-gray-500 transition-colors hover:text-gray-700">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				{#if !previewUrl}
					<!-- File Drop Zone -->
					<div
						class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors {dragActive
							? 'border-purple-500 bg-purple-50'
							: ''}"
						ondrop={handleDrop}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
					>
						<svg
							class="mx-auto mb-4 h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							></path>
						</svg>
						<p class="mb-2 text-lg font-medium text-gray-700">Drop your photo here</p>
						<p class="mb-4 text-sm text-gray-500">or click to browse</p>
						<input
							type="file"
							accept="image/*"
							onchange={handleFileSelect}
							class="hidden"
							id="photo-upload"
						/>
						<label
							for="photo-upload"
							class="inline-block cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
						>
							Choose Photo
						</label>
					</div>
				{:else}
					<!-- Preview and Form -->
					<div class="space-y-4">
						<!-- Image Preview -->
						<div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
							<img src={previewUrl} alt="Preview" class="h-full w-full object-cover" />
						</div>

						<!-- Form Fields -->
						<div>
							<label for="caption" class="mb-2 block text-sm font-medium text-gray-700">
								Caption
							</label>
							<textarea
								id="caption"
								bind:value={caption}
								placeholder="Write a caption..."
								class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
								rows="3"
							></textarea>
						</div>

						<div>
							<label for="album" class="mb-2 block text-sm font-medium text-gray-700">
								Album (optional)
							</label>
							<input
								id="album"
								type="text"
								bind:value={album}
								placeholder="Enter album name"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
							/>
						</div>

						<!-- Action Buttons -->
						<div class="flex space-x-3 pt-4">
							<button
								onclick={closeModal}
								class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
								disabled={isUploading}
							>
								Cancel
							</button>
							<button
								onclick={handleUpload}
								disabled={isUploading}
								class="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if isUploading}
									<div class="flex items-center justify-center">
										<svg
											class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Uploading...
									</div>
								{:else}
									Share
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
