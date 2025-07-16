/**
 * Check if WebGL is supported in the current browser
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * Get WebGL context info for debugging
 */
export function getWebGLInfo(): { renderer: string; vendor: string } | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    return {
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Check if device has sufficient performance for 3D rendering
 */
export function isPerformanceAdequate(): boolean {
  // Check for mobile devices which might struggle with 3D rendering
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for low-end devices
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  // Check available memory (if supported)
  const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
  
  return !isLowEnd && !hasLowMemory;
}