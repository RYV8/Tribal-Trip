window.TRIBE_TRIP_CONFIG = Object.assign(
  {
    // Docker/Nginx rewrites this file at container startup.
    apiUrl: '',
  },
  window.TRIBE_TRIP_CONFIG || {},
)
