import jsonwebtoken from 'jsonwebtoken';
const { sign, verify } = jsonwebtoken;
import 'dotenv/config'
const createToken = () => {

    let token = sign(
        {
            email: "aaa@test.com",
            anyOtherData: "123"
        },
        process.env.SECRET_KEY,
        {
            expiresIn: "30s" // "1m", "1d", "24h"
        }
    );
    console.log({ token: token });
}




const verifyToken = (token) => {

    try {
        let decoded = verify(token, process.env.SECRET_KEY)
        console.log({ decoded: decoded });
    }
    catch (ex) {
        console.log({ message: ex.message });
    }
}


const processToken = () => {
    createToken()
    verifyToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFhYUB0ZXN0LmNvbSIsImFueU90aGVyRGF0YSI6IjEyMyIsImlhdCI6MTc0NzczNTIyOSwiZXhwIjoxNzQ3NzM1MjU5fQ.urbCCkRdou6MKcCgMrbC3iem5Ya4fVoGFBT0HJhL1-M")
}

processToken()

