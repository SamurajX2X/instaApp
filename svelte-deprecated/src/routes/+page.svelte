<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import PostCard from '$lib/components/PostCard.svelte';
	import UploadModal from '$lib/components/UploadModal.svelte';

	let posts = [
		{
			id: 1,
			username: 'john_doe',
			avatar:
				'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
			image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
			caption: 'Beautiful sunset in the mountains 🌅',
			likes: 127,
			timeAgo: '2h'
		},
		{
			id: 2,
			username: 'jane_smith',
			avatar:
				'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
			image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=600&h=600&fit=crop',
			caption: 'Perfect coffee to start the day ☕️',
			likes: 89,
			timeAgo: '4h'
		},
		{
			id: 3,
			username: 'travel_lover',
			avatar:
				'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
			image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop',
			caption: 'Nature never ceases to amaze me 🌲',
			likes: 203,
			timeAgo: '6h'
		}
	];

	let isLoggedIn = true;
	let showUploadModal = $state(false);
</script>

<UploadModal bind:showModal={showUploadModal} />

<svelte:head>
	<title>InstaApp - Share Your Moments</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<Header {isLoggedIn} />

	<main class="mx-auto max-w-5xl px-4 py-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Feed -->
			<div class="lg:col-span-2">
				<!-- Stories -->
				<div class="mb-8 rounded-lg border border-gray-300 bg-white p-4">
					<div class="flex space-x-4 overflow-x-auto pb-2">
						<div class="flex min-w-[70px] flex-col items-center">
							<div
								class="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-0.5"
							>
								<div class="h-full w-full rounded-full bg-white p-0.5">
									<img
										src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
										alt="Your story"
										class="h-full w-full rounded-full object-cover"
									/>
								</div>
							</div>
							<span class="mt-1 text-xs text-gray-600">Your story</span>
						</div>
						{#each ['alex_photo', 'maria_art', 'city_life', 'food_lover', 'adventure'] as story, i}
							<div class="flex min-w-[70px] flex-col items-center">
								<div
									class="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-0.5"
								>
									<div class="h-full w-full rounded-full bg-white p-0.5">
										<img
											src="https://images.unsplash.com/photo-150{7 + i}0{i +
												3}25925346-21bda4d32df4?w=60&h=60&fit=crop&crop=face"
											alt={story}
											class="h-full w-full rounded-full object-cover"
										/>
									</div>
								</div>
								<span class="mt-1 text-xs text-gray-600">{story}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Posts -->
				{#each posts as post (post.id)}
					<PostCard {post} />
				{/each}
			</div>

			<!-- Sidebar -->
			<div class="hidden lg:block">
				<!-- Profile Summary -->
				<div class="mb-6 rounded-lg border border-gray-300 bg-white p-6">
					<div class="mb-4 flex items-center space-x-4">
						<img
							src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
							alt="Profile"
							class="h-16 w-16 rounded-full object-cover"
						/>
						<div>
							<h3 class="font-semibold">john_doe</h3>
							<p class="text-sm text-gray-500">John Doe</p>
						</div>
					</div>
					<button
						class="w-full rounded-lg bg-purple-600 py-2 text-white transition-colors hover:bg-purple-700"
						onclick={() => (showUploadModal = true)}
					>
						Upload Photo
					</button>
				</div>

				<!-- Suggestions -->
				<div class="rounded-lg border border-gray-300 bg-white p-6">
					<div class="mb-4 flex items-center justify-between">
						<h4 class="font-semibold text-gray-600">Suggestions for you</h4>
						<button class="text-sm text-blue-500 hover:text-blue-600">See All</button>
					</div>
					{#each ['photo_artist', 'travel_bug', 'food_critic'] as user, i}
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<img
									src="https://images.unsplash.com/photo-150{8 + i}0{i +
										1}25925346-21bda4d32df4?w=40&h=40&fit=crop&crop=face"
									alt={user}
									class="h-10 w-10 rounded-full object-cover"
								/>
								<div>
									<p class="text-sm font-semibold">{user}</p>
									<p class="text-xs text-gray-500">Popular</p>
								</div>
							</div>
							<button
								class="text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
							>
								Follow
							</button>
						</div>
					{/each}
				</div>

				<!-- Footer -->
				<div class="mt-8 text-center text-xs text-gray-500">
					<p>&copy; 2025 InstaApp. Made with ❤️</p>
				</div>
			</div>
		</div>
	</main>
</div>
