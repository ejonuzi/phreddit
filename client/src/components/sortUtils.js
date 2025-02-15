import axios from 'axios';

// Not used since it was not working for some reason.
export const sortPostsByNew = (posts) => {
    return posts.sort((a, b) => {
        const dateA = new Date(a.postedDate);
        const dateB = new Date(b.postedDate);
        return dateB - dateA; 
    });
};

// Not used since it was not working for some reason.
export const sortPostsByOld = (posts) => {
    return posts.sort((a, b) => {
        const dateA = new Date(a.postedDate);
        const dateB = new Date(b.postedDate);
        return dateA - dateB;
    });
};


export const sortPostsByActive = async (posts) => {
    try {
        // Fetch the most recent comments for all posts in parallel
        const comments = await Promise.all(posts.map(async (post) => {
            try {
                const response = await axios.get(`http://localhost:8000/posts/${post._id}/most-recent-comment`);
                const commentedDate = response.data.commentedDate ? new Date(response.data.commentedDate) : null;
                return { post, commentedDate };
            } catch (error) {
                return { post, commentedDate: null };
            }
        }));

        // Sort the posts by most recent comment date
        return comments.sort((a, b) => {
            if (a.commentedDate && b.commentedDate) {
                return b.commentedDate - a.commentedDate;  // Sort in descending order (most recent first)
            } else if (b.commentedDate) {
                return 1;  // b has a recent comment, so it comes first
            } else if (a.commentedDate) {
                return -1;  // a has a recent comment, so it comes first
            }
            return 0;  // If neither has a commentedDate, maintain original order
        }).map(item => item.post); 
    } catch (error) {
        console.log('Error in sorting posts by active:', error.message);
    }
};


