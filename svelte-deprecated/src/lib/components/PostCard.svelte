<script lang="ts">
	interface Post {
		id: number;
		username: string;
		avatar: string;
		image: string;
		caption: string;
		likes: number;
		timeAgo: string;
	}

	let { post }: { post: Post } = $props();

	let isLiked = $state(false);
	let likesCount = $state(post.likes);

	function toggleLike() {
		isLiked = !isLiked;
		likesCount = isLiked ? likesCount + 1 : likesCount - 1;
	}
</script>

<article class="mb-8 overflow-hidden rounded-lg border border-gray-300 bg-white">
	<!-- Post Header -->
	<div class="flex items-center justify-between p-4">
		<div class="flex items-center space-x-3">
			<img src={post.avatar} alt={post.username} class="h-10 w-10 rounded-full object-cover" />
			<div>
				<h3 class="text-sm font-semibold">{post.username}</h3>
				<p class="text-xs text-gray-500">{post.timeAgo}</p>
			</div>
		</div>
		<button class="rounded-full p-2 transition-colors hover:bg-gray-100">
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
				></path>
			</svg>
		</button>
	</div>

	<!-- Post Image -->
	<div class="aspect-square">
		<img src={post.image} alt="Post" class="h-full w-full object-cover" />
	</div>

	<!-- Post Actions -->
	<div class="p-4">
		<div class="mb-3 flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<button class="transition-transform hover:scale-110" onclick={toggleLike}>
					<svg
						class="h-6 w-6 {isLiked ? 'fill-red-500 text-red-500' : 'fill-none'}"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						></path>
					</svg>
				</button>
				<button class="transition-transform hover:scale-110">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						></path>
					</svg>
				</button>
				<button class="transition-transform hover:scale-110">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						></path>
					</svg>
				</button>
			</div>
			<button class="transition-transform hover:scale-110">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
					></path>
				</svg>
			</button>
		</div>

		<p class="mb-2 text-sm font-semibold">
			{likesCount}
			{likesCount === 1 ? 'like' : 'likes'}
		</p>
		<div class="text-sm">
			<span class="font-semibold">{post.username}</span>
			<span class="ml-2">{post.caption}</span>
		</div>
		<p class="mt-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700">View all comments</p>

		<!-- Add Comment -->
		<form class="mt-3 flex items-center" onsubmit={(e) => e.preventDefault()}>
			<input type="text" placeholder="Add a comment..." class="flex-1 py-1 text-sm outline-none" />
			<button
				type="submit"
				class="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:text-gray-400"
			>
				Post
			</button>
		</form>
	</div>
</article>
