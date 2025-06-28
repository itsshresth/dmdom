const express = require('express');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const router = express.Router();

// Initialize Twitter API client (with error handling)
let twitterClient = null;
try {
    if (process.env.TWITTER_BEARER_TOKEN) {
        twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    }
} catch (error) {
    console.log('Twitter API not available, will use fallback data');
}

// Smart Twitter data fetcher with fallback
async function getTwitterDataWithFallback(username) {
    // Try real Twitter API first
    if (twitterClient) {
        try {
            console.log(`🔍 Attempting REAL Twitter API for @${username}...`);
            
            // Get user by username with all available fields
            const user = await twitterClient.v2.userByUsername(username, {
                'user.fields': [
                    'description',
                    'location',
                    'public_metrics',
                    'verified',
                    'created_at',
                    'profile_image_url',
                    'url'
                ]
            });

            if (!user.data) {
                throw new Error(`User @${username} not found`);
            }

            // Get recent tweets
            const tweets = await twitterClient.v2.userTimeline(user.data.id, {
                max_results: 5,
                'tweet.fields': ['public_metrics', 'created_at', 'context_annotations']
            });

            return {
                success: true,
                dataSource: '🔥 REAL Twitter API v2',
                username: user.data.username,
                display_name: user.data.name,
                bio: user.data.description || 'No bio available',
                location: user.data.location || 'Location not specified',
                followers_count: user.data.public_metrics?.followers_count || 0,
                following_count: user.data.public_metrics?.following_count || 0,
                tweet_count: user.data.public_metrics?.tweet_count || 0,
                verified: user.data.verified || false,
                profile_image: user.data.profile_image_url || '',
                website: user.data.url || '',
                created_at: user.data.created_at,
                recent_tweets: tweets.data?.data?.map(tweet => ({
                    text: tweet.text,
                    created_at: tweet.created_at,
                    likes: tweet.public_metrics?.like_count || 0,
                    retweets: tweet.public_metrics?.retweet_count || 0,
                    replies: tweet.public_metrics?.reply_count || 0,
                    quotes: tweet.public_metrics?.quote_count || 0
                })) || []
            };

        } catch (apiError) {
            console.log(`❌ Twitter API failed for @${username}: ${apiError.message}`);
            console.log('🔄 Falling back to enhanced mock data...');
            
            // Fall back to enhanced mock data
            return getEnhancedMockData(username, `API Error: ${apiError.message}`);
        }
    } else {
        console.log('🔄 No Twitter API token, using enhanced mock data...');
        return getEnhancedMockData(username, 'No API token provided');
    }
}

// Enhanced mock data with realistic profiles
function getEnhancedMockData(username, reason) {
    const mockProfiles = {
        'elonmusk': {
            display_name: 'Elon Musk',
            bio: 'CEO of Tesla, SpaceX & xAI. Building sustainable transport & making life multiplanetary 🚀',
            location: 'Austin, Texas',
            followers_count: 150200000,
            following_count: 313,
            tweet_count: 45230,
            verified: true,
            website: 'https://x.ai',
            recent_tweets: [
                { text: 'Starship test flight achieved incredible altitude today! Next stop: orbit 🚀', likes: 125000, retweets: 25000, replies: 8900 },
                { text: 'Tesla FSD v12 showing remarkable improvements in city driving. The neural net is getting scary good', likes: 89000, retweets: 15600, replies: 12300 },
                { text: 'Mars colony plans advancing. 2029 launch window still achievable with current Raptor engine improvements', likes: 76000, retweets: 18900, replies: 5400 },
                { text: 'Neuralink patient can now control computer with thoughts alone. This is just the beginning', likes: 156000, retweets: 34000, replies: 21000 },
                { text: 'X platform monthly active users hit new all-time high. Free speech is working 🔥', likes: 95000, retweets: 22000, replies: 15600 }
            ]
        },
        'billgates': {
            display_name: 'Bill Gates',
            bio: 'Co-chair of the Bill & Melinda Gates Foundation. Focused on helping people lead healthy, productive lives.',
            location: 'Seattle, WA',
            followers_count: 62500000,
            following_count: 274,
            tweet_count: 3850,
            verified: true,
            website: 'https://gatesnotes.com',
            recent_tweets: [
                { text: 'Exciting progress in malaria prevention with new bed net technology. Could save millions of lives', likes: 18500, retweets: 6800, replies: 1200 },
                { text: 'Climate innovation requires collaboration between public and private sectors. Recent breakthrough in green cement promising', likes: 22000, retweets: 8900, replies: 2100 },
                { text: 'Education technology can help bridge learning gaps globally. New AI tutoring systems showing 40% improvement', likes: 15600, retweets: 4200, replies: 890 },
                { text: 'Vaccine development for next pandemic must start now. We cannot afford to be unprepared again', likes: 34000, retweets: 12000, replies: 5600 },
                { text: 'Reading "The Better Angels of Our Nature" - fascinating insights on how violence has declined throughout history', likes: 12800, retweets: 3400, replies: 1800 }
            ]
        },
        'sundarpichai': {
            display_name: 'Sundar Pichai',
            bio: 'CEO of Google and Alphabet. Focused on making technology helpful for everyone.',
            location: 'Mountain View, CA',
            followers_count: 5200000,
            following_count: 156,
            tweet_count: 1240,
            verified: true,
            website: 'https://abc.xyz',
            recent_tweets: [
                { text: 'Gemini AI showing incredible progress in reasoning capabilities. Exciting times ahead for AI research', likes: 45000, retweets: 12000, replies: 3400 },
                { text: 'Our quantum computer achieved new breakthrough in error correction. One step closer to practical quantum computing', likes: 38000, retweets: 9800, replies: 2100 },
                { text: 'Google Search now processes over 8.5 billion queries daily. Grateful for the trust users place in our products', likes: 28000, retweets: 7200, replies: 1800 },
                { text: 'Celebrating our AI for Social Good initiatives. Technology should benefit everyone, everywhere', likes: 22000, retweets: 5900, replies: 1200 },
                { text: 'Excited about our new sustainability commitments. Carbon neutral by 2030 is within reach', likes: 19000, retweets: 4800, replies: 950 }
            ]
        }
    };

    // Return enhanced profile if exists, otherwise generate realistic one
    if (mockProfiles[username.toLowerCase()]) {
        return {
            success: false,
            dataSource: `✨ Enhanced Mock Data (${reason})`,
            ...mockProfiles[username.toLowerCase()],
            username: username,
            created_at: '2009-03-15T12:00:00.000Z'
        };
    }

    // Generate realistic professional profile
    const followerCount = Math.floor(Math.random() * 100000) + 5000;
    return {
        success: false,
        dataSource: `🎭 Generated Mock Data (${reason})`,
        username: username,
        display_name: `${username.charAt(0).toUpperCase() + username.slice(1)} Professional`,
        bio: `${username} is a thought leader and professional sharing insights about innovation, technology, and industry trends. Building the future one post at a time.`,
        location: 'Global Professional Network',
        followers_count: followerCount,
        following_count: Math.floor(followerCount * 0.1) + 200,
        tweet_count: Math.floor(Math.random() * 5000) + 500,
        verified: followerCount > 50000,
        website: `https://${username}.com`,
        created_at: '2018-06-15T12:00:00.000Z',
        recent_tweets: [
            { 
                text: `Excited to share insights about the future of technology and innovation in ${new Date().getFullYear()}. The possibilities are endless!`, 
                likes: Math.floor(Math.random() * 200) + 50, 
                retweets: Math.floor(Math.random() * 80) + 15,
                replies: Math.floor(Math.random() * 30) + 5
            },
            { 
                text: `Building meaningful professional relationships is the key to success in any industry. Always looking to connect with like-minded innovators.`, 
                likes: Math.floor(Math.random() * 300) + 70, 
                retweets: Math.floor(Math.random() * 100) + 25,
                replies: Math.floor(Math.random() * 40) + 8
            },
            { 
                text: `Continuous learning and adaptation are essential in this rapidly evolving digital landscape. What are you learning today?`, 
                likes: Math.floor(Math.random() * 150) + 30, 
                retweets: Math.floor(Math.random() * 60) + 12,
                replies: Math.floor(Math.random() * 25) + 4
            },
            { 
                text: `Thrilled to be part of this amazing professional community. Together, we're shaping the future of business and technology.`, 
                likes: Math.floor(Math.random() * 180) + 40, 
                retweets: Math.floor(Math.random() * 70) + 18,
                replies: Math.floor(Math.random() * 35) + 6
            },
            { 
                text: `Innovation happens when diverse minds collaborate. Looking forward to connecting with more professionals who share this vision.`, 
                likes: Math.floor(Math.random() * 220) + 60, 
                retweets: Math.floor(Math.random() * 90) + 22,
                replies: Math.floor(Math.random() * 45) + 9
            }
        ]
    };
}

router.post('/', async (req, res) => {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
        const { handle, motive } = req.body;
        
        if (!handle || !motive) {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                content: 'Twitter handle and motive are required'
            })}\n\n`);
            res.end();
            return;
        }

        const ALCHEMYST_API_KEY = process.env.ALCHEMYST_API_KEY;
        
        if (!ALCHEMYST_API_KEY) {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                content: 'Missing Alchemyst API key'
            })}\n\n`);
            res.end();
            return;
        }

        // Send initial update
        res.write(`data: ${JSON.stringify({
            type: 'thinking_update',
            content: `🔍 Fetching profile data for @${handle}...`
        })}\n\n`);

        // GET SMART TWITTER DATA (with fallback)
        const twitterData = await getTwitterDataWithFallback(handle);
        
        // Send detailed status update
        if (twitterData.success) {
            res.write(`data: ${JSON.stringify({
                type: 'thinking_update',
                content: `✅ ${twitterData.dataSource}: ${twitterData.display_name} • ${twitterData.followers_count?.toLocaleString()} followers • ${twitterData.recent_tweets?.length} tweets`
            })}\n\n`);
        } else {
            res.write(`data: ${JSON.stringify({
                type: 'thinking_update',
                content: `⚠️ ${twitterData.dataSource} for @${handle}`
            })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({
            type: 'thinking_update',
            content: `📊 Account stats: ${twitterData.tweet_count?.toLocaleString()} total tweets • ${twitterData.following_count?.toLocaleString()} following • ${twitterData.verified ? '✅ Verified' : '❌ Not verified'}`
        })}\n\n`);

        // Enhanced prompt with comprehensive data
        const recentTweetsText = twitterData.recent_tweets
            ?.map(tweet => `"${tweet.text}" (${tweet.likes?.toLocaleString()} ❤️, ${tweet.retweets?.toLocaleString()} 🔄, ${tweet.replies?.toLocaleString()} 💬)`)
            .join(' | ') || 'No recent tweets available';

        const comprehensivePrompt = `Create a highly personalized cold DM for Twitter user @${handle} using this comprehensive profile data:

👤 PROFILE INFORMATION:
Name: ${twitterData.display_name}
Username: @${twitterData.username}
Bio: ${twitterData.bio}
Location: ${twitterData.location}
Website: ${twitterData.website}
Data Source: ${twitterData.dataSource}

📊 ACCOUNT METRICS:
Followers: ${twitterData.followers_count?.toLocaleString()}
Following: ${twitterData.following_count?.toLocaleString()}
Total Tweets: ${twitterData.tweet_count?.toLocaleString()}
Verified Status: ${twitterData.verified ? '✅ Verified Account' : '❌ Not Verified'}
Account Age: ${twitterData.created_at ? 'Since ' + new Date(twitterData.created_at).getFullYear() : 'Established user'}

📱 RECENT ACTIVITY ANALYSIS:
${recentTweetsText}

🎯 MY OUTREACH MOTIVE:
${motive}

PERSONALIZATION REQUIREMENTS:
- Reference their actual bio, location, or specific recent tweets
- Mention impressive metrics if relevant (high follower count, engagement, etc.)
- Acknowledge their expertise/field based on their content
- Keep it under 280 characters for Twitter DM compatibility
- Sound genuinely interested, not salesy
- Include a specific, actionable call-to-action
- Match their communication style if possible

Generate only the personalized DM message.`;

        res.write(`data: ${JSON.stringify({
            type: 'thinking_update',
            content: '🤖 Crafting ultra-personalized DM with comprehensive profile analysis...'
        })}\n\n`);

        // Call Alchemyst Chat API with enhanced prompt
        const alchemystResponse = await axios.post(
            'https://platform-backend.getalchemystai.com/api/v1/chat/generate/stream',
            {
                chat_history: [{
                    content: comprehensivePrompt,
                    role: 'user',
                    id: `msg_${Date.now()}`
                }],
                persona: 'maya',
                scope: 'internal'
            },
            {
                headers: {
                    'Authorization': `Bearer ${ALCHEMYST_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream',
                timeout: 30000
            }
        );

        let finalDM = '';

        // Handle streaming response
        alchemystResponse.data.on('data', (chunk) => {
            try {
                const lines = chunk.toString().split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        
                        if (data === '[DONE]') {
                            // Send enhanced metadata
                            res.write(`data: ${JSON.stringify({
                                type: 'metadata',
                                content: {
                                    chatId: `chat_${Date.now()}`,
                                    title: `${twitterData.success ? 'Real-time' : 'Enhanced'} Cold DM for @${handle}`,
                                    twitterData: {
                                        ...twitterData,
                                        scrapedAt: new Date().toISOString(),
                                        engagementScore: twitterData.recent_tweets?.reduce((sum, tweet) => sum + (tweet.likes || 0) + (tweet.retweets || 0), 0) || 0
                                    }
                                }
                            })}\n\n`);
                            
                            res.write('data: [DONE]\n\n');
                            res.end();
                            return;
                        }
                        
                        if (data && data !== '') {
                            try {
                                const parsed = JSON.parse(data);
                                
                                if (parsed.type === 'final_response') {
                                    finalDM = parsed.content;
                                    res.write(`data: ${JSON.stringify({
                                        type: 'final_response',
                                        content: finalDM,
                                        json: {}
                                    })}\n\n`);
                                } else if (parsed.type === 'thinking_update') {
                                    res.write(`data: ${JSON.stringify(parsed)}\n\n`);
                                }
                            } catch (parseError) {
                                // Ignore parsing errors for malformed chunks
                                console.log('Skipping malformed chunk');
                            }
                        }
                    }
                }
            } catch (chunkError) {
                console.error('Chunk processing error:', chunkError.message);
            }
        });

        alchemystResponse.data.on('end', () => {
            if (!res.headersSent) {
                res.write('data: [DONE]\n\n');
                res.end();
            }
        });

        alchemystResponse.data.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    content: 'Stream connection error'
                })}\n\n`);
                res.end();
            }
        });

    } catch (error) {
        console.error('Route Error:', error.message);
        if (!res.headersSent) {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                content: `Failed to generate DM: ${error.message}`
            })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;
