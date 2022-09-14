const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    console.log('req.body ',req.body)
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    // CHECKING IF USER EXISTS
    const foundUser = await User.findOne({ username: username }).exec();
    if (!foundUser) return res.status(404).json({ 'message': 'Username not found!' });

    // checking passowrd
    if (password===foundUser.password) {
        // creating JWTs 
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '600s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);

        // Creating Secure Cookie with refresh token
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: false, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        // Sending access token to user
        res.json({ accessToken });

    } else {
        res.sendStatus(401);
    }
} 

module.exports = { handleLogin };