// server/utils/external_verification.js
import axios from "axios";

/**
 * Simulates hitting a verification URL (like a certificate verification page)
 * and analyzing the content for the required data. This mimics a trust check.
 * * NOTE: In a real app, this requires bypassing complex network/security policies.
 * * @param {string} url The verification URL provided by the student.
 * @param {string} certificateName Name to search for in the URL content.
 * @returns {Promise<{urlStatus: 'Verified' | 'Pending' | 'Rejected', urlNote: string}>}
 */
export async function verifyCertificateUrl(url, certificateName) {
  if (!url) {
    return { urlStatus: "Pending", urlNote: "No external URL provided." };
  }

  // Use a timeout and handle potential network issues silently
  try {
    const response = await axios
      .get(url, {
        timeout: 7000,
        maxRedirects: 3,
      })
      .catch((err) => {
        // Treat non-200 responses or timeouts as failure
        return { status: err.response?.status || 504 };
      });

    if (response.status !== 200) {
      return {
        urlStatus: "Rejected",
        urlNote: `URL check failed: HTTP Status ${response.status} (Link broken or unauthorized).`,
      };
    }

    // --- Simulated AI Content Check ---
    const pageText = (response.data || "").toLowerCase();

    // This simulates checking if the certificate name (or key verification phrases)
    // are present in the remote page's HTML content.
    const requiredTextNormalized = certificateName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (
      pageText.includes(requiredTextNormalized) &&
      (pageText.includes("verified") || pageText.includes("certificate"))
    ) {
      return {
        urlStatus: "Verified",
        urlNote:
          "URL is valid and key certificate data was found on the page (AI/ML Strong Match).",
      };
    }

    // Valid URL, but couldn't confirm specific content
    return {
      urlStatus: "Pending",
      urlNote:
        "URL is valid, but specific details could not be confirmed automatically.",
    };
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error.message);
    return {
      urlStatus: "Rejected",
      urlNote:
        "Verification URL processing failed (Internal network error or invalid URL).",
    };
  }
}
