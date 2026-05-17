export const cldUrl = (url, w = 600) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url ?? ''
  if (/\/upload\/(w_|c_|f_|q_|h_)/.test(url)) return url
  return url.replace('/upload/', `/upload/w_${w},c_fill,f_auto,q_auto/`)
}

export const cldUrlClean = (url, w = 600) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url ?? ''
  const stripped = url.replace(/\/upload\/[^/]+\//, '/upload/')
  return stripped.replace('/upload/', `/upload/w_${w},c_fill,f_auto,q_auto/`)
}
