import jwt from 'jsonwebtoken';

export const generarJWT = (id, name, email, code, type) => {

    let expire = '';

    let secret =''; 

    if ( type === 0){
        expire = '1d'
    } else{
        type === 1 ? expire = '2h' : expire = '5min';
    }
        
    type === 1 || type === 0 ? secret = process.env.SECRET_JWT_SEED_RECOVERY : secret = process.env.SECRET_JWT_SEED_LOGIN;

    return new Promise ( ( resolve, reject) => {
        
        const payload = { id, name, email, code}; 
        jwt.sign(payload, secret, {
            expiresIn: expire
        }, (err, token) => {
            
            if( err ){
                reject('No se pudo generar el JWT');
            }
            resolve( token );
        })
    })
}