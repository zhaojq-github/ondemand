export const APP_PREFIX = window.location.origin + '/' + window.location.href.split('/').slice(3,7).join('/')

export function file_link(path) {
    return APP_PREFIX + path
}

export function file_icon(mime) {
    return (mime === 'directory') ? 'fa fa-folder-open' : 'fa fa-file'
}