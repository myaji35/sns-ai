/**
 * Instagram Graph API Integration
 * Publishes content to Instagram Business accounts
 */

interface InstagramPublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function publishToInstagram(
  accessToken: string,
  instagramAccountId: string,
  content: {
    caption: string;
    imageUrl?: string;
  }
): Promise<InstagramPublishResult> {
  try {
    // Instagram requires an image for posts
    if (!content.imageUrl) {
      return {
        success: false,
        error: 'Instagram posts require an image',
      };
    }

    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}/media`;
    const containerParams = new URLSearchParams({
      image_url: content.imageUrl,
      caption: content.caption,
      access_token: accessToken,
    });

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      body: containerParams,
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok || !containerData.id) {
      console.error('Failed to create media container:', containerData);
      return {
        success: false,
        error: containerData.error?.message || 'Failed to create media container',
      };
    }

    const creationId = containerData.id;

    // Step 2: Publish the container
    const publishUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`;
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      body: publishParams,
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || !publishData.id) {
      console.error('Failed to publish media:', publishData);
      return {
        success: false,
        error: publishData.error?.message || 'Failed to publish media',
      };
    }

    const mediaId = publishData.id;

    // Instagram post URL format
    const postUrl = `https://www.instagram.com/p/${mediaId}`;

    return {
      success: true,
      postId: mediaId,
      url: postUrl,
    };
  } catch (error: any) {
    console.error('Instagram publish error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Refresh Instagram access token (for long-lived tokens)
 */
export async function refreshInstagramToken(
  accessToken: string
): Promise<{ success: boolean; accessToken?: string; expiresIn?: number; error?: string }> {
  try {
    const url = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken,
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Failed to refresh token',
      };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
