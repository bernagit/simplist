export function getHTMLSectionId(sectionId: string) {
  return `section-${sectionId}`
}

export const contextMenuStyles = {
  root: {
    width: 200,
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
    padding: 8,
    marginLeft: -100
  }
}

export function getDefaultViewFromString(view: string | undefined) {
  if (view === 'calendar') {
    return '/calendar'
  } else if (view?.startsWith('list:')) {
    const listId = view.split(':')[1]
    return `/lists/${listId}`
  } else {
    return '/'
  }
}
