export async function handleExpress(req, res) {
  try {
    const appModule = await import('../backend/src/app.js')
    const app = appModule.default || appModule
    await new Promise((resolve) => {
      res.on('finish', resolve)
      res.on('close', resolve)
      app(req, res)
    })
  } catch (error) {
    console.error('Serverless handler error:', error)
    res.status(500).json({
      success: false,
      error: 'Serverless function initialization failed',
      message: error.message,
      stack: error.stack,
    })
  }
}
