// ============================================
// DATA MANAGEMENT & STORAGE
// ============================================

class DataStore {
    static init() {
        // Initialize default data structure if not exists
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('posts')) {
            localStorage.setItem('posts', JSON.stringify([]));
        }
        if (!localStorage.getItem('friendRequests')) {
            localStorage.setItem('friendRequests', JSON.stringify([]));
        }
        if (!localStorage.getItem('welcomePosts')) {
            this.initWelcomePosts();
        }
    }

    static initWelcomePosts() {
        const welcomePosts = [
            {
                id: 'welcome-1',
                userId: 'system',
                userName: 'LetsTalk Team',
                userPic: '🌟',
                content: "Welcome to LetsTalk! What brings you to our platform? We'd love to hear what you're hoping to get out of this equal engagement community.",
                timestamp: Date.now(),
                responses: []
            },
            {
                id: 'welcome-2',
                userId: 'system',
                userName: 'LetsTalk Team',
                userPic: '💬',
                content: "What's one thing you're passionate about? Whether it's a hobby, cause, or interest - share what makes you excited!",
                timestamp: Date.now(),
                responses: []
            },
            {
                id: 'welcome-3',
                userId: 'system',
                userName: 'LetsTalk Team',
                userPic: '🎭',
                content: "How are you feeling today? This is a space where everyone's emotions and experiences matter equally.",
                timestamp: Date.now(),
                responses: []
            }
        ];
        localStorage.setItem('welcomePosts', JSON.stringify(welcomePosts));
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    static saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    static getPosts() {
        return JSON.parse(localStorage.getItem('posts')) || [];
    }

    static savePosts(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    static getWelcomePosts() {
        return JSON.parse(localStorage.getItem('welcomePosts')) || [];
    }

    static saveWelcomePosts(posts) {
        localStorage.setItem('welcomePosts', JSON.stringify(posts));
    }

    static getFriendRequests() {
        return JSON.parse(localStorage.getItem('friendRequests')) || [];
    }

    static saveFriendRequests(requests) {
        localStorage.setItem('friendRequests', JSON.stringify(requests));
    }

    static getCurrentUser() {
        const email = localStorage.getItem('currentUser');
        if (!email) return null;
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }

    static updateCurrentUser(userData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email === userData.email);
        if (index !== -1) {
            users[index] = userData;
            this.saveUsers(users);
        }
    }

    static setCurrentUser(email) {
        localStorage.setItem('currentUser', email);
    }

    static clearCurrentUser() {
        localStorage.removeItem('currentUser');
    }
}

// ============================================
// AUTHENTICATION
// ============================================

class Auth {
    static signup(name, email, password, bio = '') {
        const users = DataStore.getUsers();

        // Check if user exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Validate password
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Create new user
        const newUser = {
            id: 'user-' + Date.now(),
            name,
            email,
            password, // In production, this would be hashed
            bio,
            profilePic: '👤',
            responseCredits: 0,
            friends: [],
            hasCompletedWelcome: false,
            createdAt: Date.now()
        };

        users.push(newUser);
        DataStore.saveUsers(users);

        return { success: true, user: newUser };
    }

    static login(email, password) {
        const users = DataStore.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        return { success: true, user };
    }

    static logout() {
        DataStore.clearCurrentUser();
    }
}

// ============================================
// RELEVANCE VALIDATION (Free keyword-based)
// ============================================

class RelevanceValidator {
    static validate(originalPost, response) {
        // Extract keywords from original post
        const originalWords = this.extractKeywords(originalPost.toLowerCase());
        const responseWords = this.extractKeywords(response.toLowerCase());

        // Check for common words
        const commonWords = originalWords.filter(word => responseWords.includes(word));

        // Calculate relevance score
        const relevanceScore = commonWords.length / Math.max(originalWords.length, 1);

        // Check response length (prevent one-word responses)
        const wordCount = response.trim().split(/\s+/).length;

        if (wordCount < 3) {
            return {
                isRelevant: false,
                score: 0,
                message: 'Response too short. Please write at least 3 words.',
                level: 'invalid'
            };
        }

        if (relevanceScore >= 0.3 || commonWords.length >= 2) {
            return {
                isRelevant: true,
                score: relevanceScore,
                message: 'Great! Your response appears relevant to the post.',
                level: 'valid'
            };
        } else if (relevanceScore >= 0.15 || commonWords.length >= 1) {
            return {
                isRelevant: true,
                score: relevanceScore,
                message: 'Your response might be loosely related. Consider engaging more directly with the topic.',
                level: 'warning'
            };
        } else {
            return {
                isRelevant: false,
                score: relevanceScore,
                message: 'Your response doesn\'t seem related to the post. Try addressing the topic directly.',
                level: 'invalid'
            };
        }
    }

    static extractKeywords(text) {
        // Remove common stop words
        const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
                          'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
                          'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has',
                          'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
                          'can', 'may', 'might', 'i', 'you', 'he', 'she', 'we', 'they',
                          'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him', 'her',
                          'us', 'them', 'what', 'when', 'where', 'who', 'why', 'how'];

        const words = text
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        return words;
    }
}

// ============================================
// POST MANAGEMENT
// ============================================

class PostManager {
    static createPost(content) {
        const user = DataStore.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        if (user.responseCredits < 1) {
            return { success: false, message: 'You need response credits to post. Respond to a post first!' };
        }

        // Check daily post limit (3 posts per day)
        const userPosts = this.getUserPosts(user.id);
        const today = new Date().setHours(0, 0, 0, 0);
        const todaysPosts = userPosts.filter(p => {
            const postDate = new Date(p.timestamp).setHours(0, 0, 0, 0);
            return postDate === today;
        });

        if (todaysPosts.length >= 3) {
            return { success: false, message: 'Daily post limit reached (3 posts per day)' };
        }

        const post = {
            id: 'post-' + Date.now(),
            userId: user.id,
            userName: user.name,
            userPic: user.profilePic,
            content,
            timestamp: Date.now(),
            responses: []
        };

        const posts = DataStore.getPosts();
        posts.unshift(post);
        DataStore.savePosts(posts);

        // Deduct credit
        user.responseCredits -= 1;
        DataStore.updateCurrentUser(user);

        return { success: true, post };
    }

    static deletePost(postId) {
        const user = DataStore.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        const posts = DataStore.getPosts();
        const post = posts.find(p => p.id === postId);

        if (!post) return { success: false, message: 'Post not found' };

        // Only allow user to delete their own posts
        if (post.userId !== user.id) {
            return { success: false, message: 'You can only delete your own posts' };
        }

        // Remove post
        const updatedPosts = posts.filter(p => p.id !== postId);
        DataStore.savePosts(updatedPosts);

        // Refund credit
        user.responseCredits = Math.min((user.responseCredits || 0) + 1, 3);
        DataStore.updateCurrentUser(user);

        return { success: true };
    }

    static respondToPost(postId, responseContent, isWelcomePost = false) {
        const user = DataStore.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        let posts, post;

        if (isWelcomePost) {
            posts = DataStore.getWelcomePosts();
            post = posts.find(p => p.id === postId);
        } else {
            posts = DataStore.getPosts();
            post = posts.find(p => p.id === postId);
        }

        if (!post) return { success: false, message: 'Post not found' };

        // Validate relevance
        const validation = RelevanceValidator.validate(post.content, responseContent);
        if (!validation.isRelevant) {
            return { success: false, message: validation.message };
        }

        // Add response
        const response = {
            id: 'response-' + Date.now(),
            userId: user.id,
            userName: user.name,
            userPic: user.profilePic,
            content: responseContent,
            timestamp: Date.now(),
            relevanceScore: validation.score
        };

        post.responses.push(response);

        if (isWelcomePost) {
            DataStore.saveWelcomePosts(posts);
            // Mark welcome as complete if first time
            if (!user.hasCompletedWelcome) {
                user.hasCompletedWelcome = true;
            }
        } else {
            DataStore.savePosts(posts);
        }

        // Add credit
        user.responseCredits = Math.min((user.responseCredits || 0) + 1, 3);
        DataStore.updateCurrentUser(user);

        return { success: true, response, validation };
    }

    static deleteResponse(postId, responseId, isWelcomePost = false) {
        const user = DataStore.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        let posts, post;

        if (isWelcomePost) {
            posts = DataStore.getWelcomePosts();
            post = posts.find(p => p.id === postId);
        } else {
            posts = DataStore.getPosts();
            post = posts.find(p => p.id === postId);
        }

        if (!post) return { success: false, message: 'Post not found' };

        const response = post.responses.find(r => r.id === responseId);
        if (!response) return { success: false, message: 'Response not found' };

        // Only allow user to delete their own responses
        if (response.userId !== user.id) {
            return { success: false, message: 'You can only delete your own responses' };
        }

        // Check 2-minute time limit
        const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
        const timeSinceResponse = Date.now() - response.timestamp;

        if (timeSinceResponse > twoMinutes) {
            return { success: false, message: 'You can only delete responses within 2 minutes of posting' };
        }

        // Remove response
        post.responses = post.responses.filter(r => r.id !== responseId);

        if (isWelcomePost) {
            DataStore.saveWelcomePosts(posts);
        } else {
            DataStore.savePosts(posts);
        }

        // Deduct credit
        user.responseCredits = Math.max((user.responseCredits || 0) - 1, 0);
        DataStore.updateCurrentUser(user);

        return { success: true };
    }

    static getUserPosts(userId) {
        const posts = DataStore.getPosts();
        return posts.filter(p => p.userId === userId);
    }

    static getFriendPosts(friendIds) {
        const posts = DataStore.getPosts();
        return posts.filter(p => friendIds.includes(p.userId));
    }
}

// ============================================
// FRIEND MANAGEMENT
// ============================================

class FriendManager {
    static sendRequest(recipientEmail) {
        const user = DataStore.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        const users = DataStore.getUsers();
        const recipient = users.find(u => u.email === recipientEmail);

        if (!recipient) {
            return { success: false, message: 'User not found with that email' };
        }

        if (recipient.id === user.id) {
            return { success: false, message: 'You cannot add yourself as a friend' };
        }

        if (user.friends.includes(recipient.id)) {
            return { success: false, message: 'Already friends with this user' };
        }

        const requests = DataStore.getFriendRequests();

        // Check if request already exists
        if (requests.find(r => r.from === user.id && r.to === recipient.id && r.status === 'pending')) {
            return { success: false, message: 'Friend request already sent' };
        }

        // Create request
        const request = {
            id: 'request-' + Date.now(),
            from: user.id,
            fromName: user.name,
            fromPic: user.profilePic,
            to: recipient.id,
            status: 'pending',
            timestamp: Date.now()
        };

        requests.push(request);
        DataStore.saveFriendRequests(requests);

        return { success: true, message: 'Friend request sent!' };
    }

    static acceptRequest(requestId) {
        const user = DataStore.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in' };

        const requests = DataStore.getFriendRequests();
        const request = requests.find(r => r.id === requestId);

        if (!request || request.to !== user.id) {
            return { success: false, message: 'Request not found' };
        }

        // Add to both users' friend lists
        const users = DataStore.getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        const friendIndex = users.findIndex(u => u.id === request.from);

        if (userIndex !== -1 && friendIndex !== -1) {
            users[userIndex].friends.push(request.from);
            users[friendIndex].friends.push(user.id);
            DataStore.saveUsers(users);
        }

        // Remove request
        const updatedRequests = requests.filter(r => r.id !== requestId);
        DataStore.saveFriendRequests(updatedRequests);

        return { success: true, message: 'Friend request accepted!' };
    }

    static rejectRequest(requestId) {
        const requests = DataStore.getFriendRequests();
        const updatedRequests = requests.filter(r => r.id !== requestId);
        DataStore.saveFriendRequests(updatedRequests);
        return { success: true };
    }

    static getPendingRequests(userId) {
        const requests = DataStore.getFriendRequests();
        return requests.filter(r => r.to === userId && r.status === 'pending');
    }

    static getFriends(userId) {
        const users = DataStore.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return [];

        return users.filter(u => user.friends.includes(u.id));
    }
}

// ============================================
// UI CONTROLLER
// ============================================

class UI {
    static init() {
        DataStore.init();
        this.bindAuthEvents();
        this.bindNavEvents();
        this.bindPostEvents();
        this.bindProfileEvents();
        this.bindFriendEvents();
        this.bindModalEvents();
        this.checkAuth();
    }

    static checkAuth() {
        const user = DataStore.getCurrentUser();
        if (user) {
            if (!user.hasCompletedWelcome) {
                this.showWelcomeScreen();
            } else {
                this.showApp();
            }
        } else {
            this.showAuthScreen();
        }
    }

    static showAuthScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('auth-screen').classList.add('active');
    }

    static showWelcomeScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('welcome-screen').classList.add('active');
        this.renderWelcomePosts();
    }

    static showApp() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('app-screen').classList.add('active');
        this.updateCreditsDisplay();
        this.showView('feed');
    }

    static showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        document.getElementById(`${viewName}-view`).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        if (viewName === 'feed') {
            this.renderFeed();
        } else if (viewName === 'profile') {
            this.renderProfile();
        } else if (viewName === 'friends') {
            this.renderFriends();
        }
    }

    // ============================================
    // AUTH EVENTS
    // ============================================

    static bindAuthEvents() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${tabName}-form`).classList.add('active');
            });
        });

        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const result = Auth.login(email, password);
            if (result.success) {
                DataStore.setCurrentUser(email);
                this.checkAuth();
            } else {
                document.getElementById('login-error').textContent = result.message;
            }
        });

        // Signup
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const bio = document.getElementById('signup-bio').value;

            const result = Auth.signup(name, email, password, bio);
            if (result.success) {
                DataStore.setCurrentUser(email);
                this.checkAuth();
            } else {
                document.getElementById('signup-error').textContent = result.message;
            }
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            Auth.logout();
            this.checkAuth();
        });
    }

    // ============================================
    // NAVIGATION EVENTS
    // ============================================

    static bindNavEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.showView(view);
            });
        });
    }

    // ============================================
    // WELCOME POSTS
    // ============================================

    static renderWelcomePosts() {
        const posts = DataStore.getWelcomePosts();
        const container = document.getElementById('welcome-posts');

        container.innerHTML = posts.map(post => this.renderPost(post, true)).join('');
    }

    // ============================================
    // POST EVENTS
    // ============================================

    static bindPostEvents() {
        // Create post button
        document.getElementById('create-post-btn').addEventListener('click', () => {
            const section = document.getElementById('create-post-section');
            section.classList.toggle('hidden');
            this.updateCreditsDisplay();
        });

        // Cancel post
        document.getElementById('cancel-post-btn').addEventListener('click', () => {
            document.getElementById('create-post-section').classList.add('hidden');
            document.getElementById('post-content').value = '';
            document.getElementById('char-count').textContent = '0';
        });

        // Character count
        document.getElementById('post-content').addEventListener('input', (e) => {
            document.getElementById('char-count').textContent = e.target.value.length;
        });

        // Submit post
        document.getElementById('submit-post-btn').addEventListener('click', () => {
            const content = document.getElementById('post-content').value.trim();

            if (!content) {
                document.getElementById('post-error').textContent = 'Post cannot be empty';
                return;
            }

            const result = PostManager.createPost(content);
            if (result.success) {
                document.getElementById('post-content').value = '';
                document.getElementById('char-count').textContent = '0';
                document.getElementById('create-post-section').classList.add('hidden');
                document.getElementById('post-error').textContent = '';
                this.updateCreditsDisplay();
                this.renderFeed();
            } else {
                document.getElementById('post-error').textContent = result.message;
            }
        });

        // Delete post (delegated event)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-post-btn')) {
                const postId = e.target.dataset.postId;

                if (confirm('Are you sure you want to delete this post? You will get 1 credit back.')) {
                    const result = PostManager.deletePost(postId);
                    if (result.success) {
                        this.updateCreditsDisplay();
                        // Re-render current view
                        const activeView = document.querySelector('.nav-btn.active')?.dataset.view;
                        if (activeView === 'feed') {
                            this.renderFeed();
                        } else if (activeView === 'profile') {
                            this.renderProfile();
                        }
                    } else {
                        alert(result.message);
                    }
                }
            }

            // Delete response (delegated event)
            if (e.target.classList.contains('delete-response-btn')) {
                const postId = e.target.dataset.postId;
                const responseId = e.target.dataset.responseId;
                const isWelcome = e.target.dataset.isWelcome === 'true';

                if (confirm('Are you sure you want to delete this response? You will lose 1 credit.')) {
                    const result = PostManager.deleteResponse(postId, responseId, isWelcome);
                    if (result.success) {
                        this.updateCreditsDisplay();
                        // Re-render current view
                        if (isWelcome) {
                            this.renderWelcomePosts();
                        } else {
                            const activeView = document.querySelector('.nav-btn.active')?.dataset.view;
                            if (activeView === 'feed') {
                                this.renderFeed();
                            } else if (activeView === 'profile') {
                                this.renderProfile();
                            }
                        }
                    } else {
                        alert(result.message);
                    }
                }
            }
        });
    }

    // ============================================
    // RENDER FEED
    // ============================================

    static renderFeed() {
        const user = DataStore.getCurrentUser();
        const posts = PostManager.getFriendPosts(user.friends);
        const container = document.getElementById('feed-posts');
        const emptyMessage = document.getElementById('empty-feed-message');

        if (posts.length === 0) {
            container.innerHTML = '';
            emptyMessage.classList.remove('hidden');
            return;
        }

        emptyMessage.classList.add('hidden');
        container.innerHTML = posts.map(post => this.renderPost(post)).join('');
    }

    static renderPost(post, isWelcomePost = false) {
        const user = DataStore.getCurrentUser();
        const timeAgo = this.getTimeAgo(post.timestamp);
        const isOwnPost = post.userId === user.id;

        return `
            <div class="post">
                <div class="post-header">
                    <div class="profile-pic">${post.userPic}</div>
                    <div class="post-user-info">
                        <h4>${post.userName}</h4>
                        <span class="post-timestamp">${timeAgo}</span>
                    </div>
                    ${isOwnPost ? `
                        <button class="delete-post-btn" data-post-id="${post.id}" title="Delete post">🗑️</button>
                    ` : ''}
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-footer">
                    <div class="post-stats">${post.responses.length} responses</div>
                    ${!isOwnPost ? `
                        <button class="respond-btn"
                                data-post-id="${post.id}"
                                data-is-welcome="${isWelcomePost}">
                            Respond
                        </button>
                    ` : '<span style="color: #999; font-size: 0.9em;">Your post</span>'}
                </div>
                ${post.responses.length > 0 ? `
                    <div class="post-responses">
                        ${post.responses.slice(-3).map(r => {
                            const isOwnResponse = r.userId === user.id;
                            const timeSinceResponse = Date.now() - r.timestamp;
                            const canDelete = isOwnResponse && timeSinceResponse <= 120000; // 2 minutes
                            const responseTimeAgo = this.getTimeAgo(r.timestamp);

                            return `
                                <div class="response">
                                    <div class="response-header">
                                        <div class="response-pic">${r.userPic}</div>
                                        <div style="flex: 1;">
                                            <span class="response-user">${r.userName}</span>
                                            <span class="response-timestamp">${responseTimeAgo}</span>
                                        </div>
                                        ${canDelete ? `
                                            <button class="delete-response-btn"
                                                    data-post-id="${post.id}"
                                                    data-response-id="${r.id}"
                                                    data-is-welcome="${isWelcomePost}"
                                                    title="Delete response (within 2 min)">🗑️</button>
                                        ` : ''}
                                    </div>
                                    <div class="response-content">${r.content}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ============================================
    // MODAL EVENTS
    // ============================================

    static bindModalEvents() {
        const modal = document.getElementById('response-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancel-response-btn');
        const submitBtn = document.getElementById('submit-response-btn');
        const responseTextarea = document.getElementById('response-content');

        // Delegate respond button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('respond-btn') && !e.target.disabled) {
                const postId = e.target.dataset.postId;
                const isWelcome = e.target.dataset.isWelcome === 'true';
                this.openResponseModal(postId, isWelcome);
            }
        });

        // Close modal
        const closeModal = () => {
            modal.classList.add('hidden');
            responseTextarea.value = '';
            document.getElementById('response-char-count').textContent = '0';
            document.getElementById('validation-message').textContent = '';
            document.getElementById('response-error').textContent = '';
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Character count and validation
        responseTextarea.addEventListener('input', (e) => {
            const content = e.target.value;
            document.getElementById('response-char-count').textContent = content.length;

            // Live validation
            const postContent = document.getElementById('original-post-content').textContent;
            if (content.trim().length > 0) {
                const validation = RelevanceValidator.validate(postContent, content);
                const validationEl = document.querySelector('.response-validation');
                const messageEl = document.getElementById('validation-message');

                validationEl.className = 'response-validation ' + validation.level;
                messageEl.textContent = validation.message;
            }
        });

        // Submit response
        submitBtn.addEventListener('click', () => {
            const content = responseTextarea.value.trim();
            const postId = submitBtn.dataset.postId;
            const isWelcome = submitBtn.dataset.isWelcome === 'true';

            if (!content) {
                document.getElementById('response-error').textContent = 'Response cannot be empty';
                return;
            }

            const result = PostManager.respondToPost(postId, content, isWelcome);
            if (result.success) {
                closeModal();
                this.updateCreditsDisplay();

                if (isWelcome) {
                    this.renderWelcomePosts();
                    // Check if user can now access main app
                    const user = DataStore.getCurrentUser();
                    if (user.hasCompletedWelcome) {
                        setTimeout(() => this.showApp(), 500);
                    }
                } else {
                    this.renderFeed();
                }
            } else {
                document.getElementById('response-error').textContent = result.message;
            }
        });
    }

    static openResponseModal(postId, isWelcome = false) {
        let post;
        if (isWelcome) {
            const posts = DataStore.getWelcomePosts();
            post = posts.find(p => p.id === postId);
        } else {
            const posts = DataStore.getPosts();
            post = posts.find(p => p.id === postId);
        }

        if (!post) return;

        document.getElementById('original-post-content').textContent = post.content;
        document.getElementById('submit-response-btn').dataset.postId = postId;
        document.getElementById('submit-response-btn').dataset.isWelcome = isWelcome;
        document.getElementById('response-modal').classList.remove('hidden');
        document.getElementById('response-content').focus();
    }

    // ============================================
    // PROFILE EVENTS
    // ============================================

    static bindProfileEvents() {
        // Edit profile button
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            const section = document.getElementById('edit-profile-section');
            section.classList.toggle('hidden');

            if (!section.classList.contains('hidden')) {
                const user = DataStore.getCurrentUser();
                document.getElementById('edit-name').value = user.name;
                document.getElementById('edit-bio').value = user.bio || '';

                // Highlight current pic
                document.querySelectorAll('.pic-option').forEach(opt => {
                    opt.classList.remove('selected');
                    if (opt.textContent === user.profilePic) {
                        opt.classList.add('selected');
                    }
                });
            }
        });

        // Profile pic selection
        document.querySelectorAll('.pic-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.pic-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Cancel edit
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-profile-section').classList.add('hidden');
        });

        // Save profile
        document.getElementById('save-profile-btn').addEventListener('click', () => {
            const user = DataStore.getCurrentUser();
            const name = document.getElementById('edit-name').value.trim();
            const bio = document.getElementById('edit-bio').value.trim();
            const selectedPic = document.querySelector('.pic-option.selected');

            if (!name) {
                alert('Name cannot be empty');
                return;
            }

            user.name = name;
            user.bio = bio;
            if (selectedPic) {
                user.profilePic = selectedPic.textContent;
            }

            DataStore.updateCurrentUser(user);
            document.getElementById('edit-profile-section').classList.add('hidden');
            this.renderProfile();
        });
    }

    static renderProfile() {
        const user = DataStore.getCurrentUser();
        const posts = PostManager.getUserPosts(user.id);

        document.getElementById('profile-pic-display').textContent = user.profilePic;
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-bio').textContent = user.bio || 'No bio yet';
        document.getElementById('profile-post-count').textContent = posts.length;
        document.getElementById('profile-friend-count').textContent = user.friends.length;
        document.getElementById('profile-credits').textContent = user.responseCredits;

        const container = document.getElementById('profile-posts');
        const emptyMessage = document.getElementById('empty-profile-message');

        if (posts.length === 0) {
            container.innerHTML = '';
            emptyMessage.classList.remove('hidden');
            return;
        }

        emptyMessage.classList.add('hidden');
        container.innerHTML = posts.map(post => this.renderPost(post)).join('');
    }

    // ============================================
    // FRIEND EVENTS
    // ============================================

    static bindFriendEvents() {
        // Add friend
        document.getElementById('add-friend-btn').addEventListener('click', () => {
            const email = document.getElementById('friend-email').value.trim();

            if (!email) {
                document.getElementById('friend-error').textContent = 'Please enter an email';
                return;
            }

            const result = FriendManager.sendRequest(email);
            if (result.success) {
                document.getElementById('friend-email').value = '';
                document.getElementById('friend-error').textContent = '';
                document.getElementById('friend-success').textContent = result.message;
                setTimeout(() => {
                    document.getElementById('friend-success').textContent = '';
                }, 3000);
            } else {
                document.getElementById('friend-error').textContent = result.message;
                document.getElementById('friend-success').textContent = '';
            }
        });

        // Delegate accept/reject buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('accept-btn')) {
                const requestId = e.target.dataset.requestId;
                FriendManager.acceptRequest(requestId);
                this.renderFriends();
            } else if (e.target.classList.contains('reject-btn')) {
                const requestId = e.target.dataset.requestId;
                FriendManager.rejectRequest(requestId);
                this.renderFriends();
            }
        });
    }

    static renderFriends() {
        const user = DataStore.getCurrentUser();

        // Friend requests
        const requests = FriendManager.getPendingRequests(user.id);
        const requestsContainer = document.getElementById('friend-requests');
        document.getElementById('request-count').textContent = requests.length;

        if (requests.length === 0) {
            requestsContainer.innerHTML = '<p style="color: #999;">No pending requests</p>';
        } else {
            requestsContainer.innerHTML = requests.map(req => `
                <div class="friend-request">
                    <div class="friend-request-info">
                        <div class="profile-pic">${req.fromPic}</div>
                        <span class="friend-name">${req.fromName}</span>
                    </div>
                    <div class="friend-request-actions">
                        <button class="accept-btn" data-request-id="${req.id}">Accept</button>
                        <button class="reject-btn" data-request-id="${req.id}">Reject</button>
                    </div>
                </div>
            `).join('');
        }

        // Friends list
        const friends = FriendManager.getFriends(user.id);
        const friendsContainer = document.getElementById('friends-list');
        document.getElementById('friends-count').textContent = friends.length;

        if (friends.length === 0) {
            friendsContainer.innerHTML = '<p style="color: #999;">No friends yet. Send a friend request to get started!</p>';
        } else {
            friendsContainer.innerHTML = friends.map(friend => `
                <div class="friend-item">
                    <div class="profile-pic">${friend.profilePic}</div>
                    <div>
                        <div class="friend-name">${friend.name}</div>
                        <div style="font-size: 0.85em; color: #666;">${friend.email}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    static updateCreditsDisplay() {
        const user = DataStore.getCurrentUser();
        if (user) {
            document.getElementById('credit-count').textContent = user.responseCredits;
            document.getElementById('credits-available').textContent = user.responseCredits;
        }
    }

    static getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        return Math.floor(seconds / 86400) + ' days ago';
    }
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
