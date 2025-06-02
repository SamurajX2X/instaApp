<script lang="ts">
	import UploadModal from './UploadModal.svelte';

	let { isLoggedIn = false }: { isLoggedIn?: boolean } = $props();

	let searchQuery = $state('');
	let showNotifications = $state(false);
	let showUploadModal = $state(false);
</script>

<UploadModal bind:showModal={showUploadModal} />

<header class="sticky top-0 z-40 border-b border-gray-300 bg-white">
	<div class="mx-auto max-w-5xl px-4 py-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-8">
				<a
					href="/"
					class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent"
				>
					InstaApp
				</a>
				<div class="hidden md:block">
					<input
						bind:value={searchQuery}
						type="text"
						placeholder="Search"
						class="w-64 rounded-lg border-none bg-gray-100 px-4 py-2 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
					/>
				</div>
			</div>

			<nav class="flex items-center space-x-6">
				<a href="/" class="transition-transform hover:scale-110" title="Home" aria-label="Home">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						></path>
					</svg>
				</a>

				<button class="transition-transform hover:scale-110" title="Messages" aria-label="Messages">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						></path>
					</svg>
				</button>
				<button
					class="transition-transform hover:scale-110"
					title="Create"
					aria-label="Create"
					onclick={() => (showUploadModal = true)}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
						></path>
					</svg>
				</button>
				<button class="transition-transform hover:scale-110" title="Expl	ore" aria-label="Explore">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</button>

				<div class="relative">
					<button
						class="relative transition-transform hover:scale-110"
						onclick={() => (showNotifications = !showNotifications)}
						title="Activity"
						aria-label="Activity"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							></path>
						</svg>
						<!-- Notification dot -->
						<span class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs"></span>
					</button>

					{#if showNotifications}
						<div
							class="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
						>
							<div class="border-b border-gray-100 px-4 py-2">
								<h3 class="font-semibold">Activity</h3>
							</div>
							<div class="max-h-64 overflow-y-auto">
								<div class="cursor-pointer px-4 py-3 hover:bg-gray-50">
									<p class="text-sm">
										<span class="font-semibold">jane_smith</span> liked your post
									</p>
									<p class="text-xs text-gray-500">2 hours ago</p>
								</div>
								<div class="cursor-pointer px-4 py-3 hover:bg-gray-50">
									<p class="text-sm">
										<span class="font-semibold">travel_lover</span> started following you
									</p>
									<p class="text-xs text-gray-500">4 hours ago</p>
								</div>
							</div>
						</div>
					{/if}
				</div>

				{#if isLoggedIn}
					<div
						class="h-8 w-8 cursor-pointer overflow-hidden rounded-full transition-all hover:ring-2 hover:ring-purple-500"
					>
						<img
							src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
							alt="Profile"
							class="h-full w-full object-cover"
						/>
					</div>
				{:else}
					<button
						class="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
					>
						Login
					</button>
				{/if}
			</nav>
		</div>
	</div>
</header>
