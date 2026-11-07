/** Keep the embedded preview until the full image is ready to paint. */
export function afterImageDecode(image: HTMLImageElement, ready: () => void): void {
  const source = image.src;
  const finish = () => {
    if (image.isConnected && image.src === source && image.complete && image.naturalWidth > 0) ready();
  };
  if (typeof image.decode === 'function') {
    void image.decode().then(finish, finish);
  } else {
    finish();
  }
}
