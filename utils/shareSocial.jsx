/**
 * Shares content to social media using the native Web Share API with a fallback to window.open.
 * @param {string} platform - The name of the social media platform (e.g., 'twitter', 'facebook').
 * @param {string} treeName - The name of the tree to include in the share text.
 */


export const shareToSocialMedia = async (platform, treeName = 'my', slug) => {
  const url = `${window.location.origin}/tree/${slug}`;
  // Create a more dynamic and engaging share text
  const text = `Check out ${treeName} Wish Tree! 🌳✨`;
  const title = 'My Wish Tree'; // Title used by the Web Share API
  
  // 1. Try using the modern Web Share API first
  if (platform == 'modernshare') {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        console.log('Content shared successfully!');
        return; // Stop the function here if successful
      } catch (error) {
        // This error often means the user canceled the share.
        // We can safely ignore it or log it if needed.
        console.log('Share was canceled or failed:', error);
        return; // Stop here, don't fall back to popup
      }
    }};

  // Using the standard facebook sharer is often a good enough alternative.
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    whatsapp: `https://web.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  };
  const shareUrl = shareUrls[platform];
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  } else {
    console.error(`No share URL defined for platform: ${platform}`);
  }
};