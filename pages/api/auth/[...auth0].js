import auth0 from 'src/util/auth0'

export default auth0.handleAuth({
  // other stuff here...
  async callback(req, res) {
    try {
      await auth0.handleCallback(req, res)
    } catch (error) {
      res.redirect('/')
    }
  }
})