import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config();

const mail = {
    user: 'fernandojp2155@gmail.com',
    pass: 'yllo euon tluy hueo',
}

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: mail.user, // generated ethereal user
    pass: mail.pass, // generated ethereal password
},
});

export const sendEmail = async(email, subject, html) => {
try{
    // send mail with defined transport object
    await transporter.sendMail({
        from: 	`MHCode <${mail.user}>`, // sender address
        to: email, // list of receivers
        subject, // Subject line
        text: "Prueba de verificación de correo", // plain text body
        html, // html body
    })
    ;
} catch(error){
    console.log('Algo no esta bien con el email', error);
}
}

export const getTemplateConfirm = (name, token, msg, link, contraseña) => {
return `
<head>
    <Link rel="stylesheet" href="./style.css">
</head>

<div id="email__content">
    <img src ="https://www.example.com/images/dinosaur.jpg"" alt="">
    <h2> Bienvenido ${ name }</h2>
    <p> ${ msg } </p>
    <p> ${ contraseña } </p>

    <a
        href="${process.env.HOST}api/auth/register/confirm/${ token }"
        target="_blank"
        > ${ link }</a>
</div>
`
}

export const getTemplateChangePassword = (name, token, msg, link) => {
    return `
    <head>
        <Link rel="stylesheet" href="./style.css">
    </head>
    
    <div id="email__content">
        <img src ="https://www.example.com/images/dinosaur.jpg"" alt="">
        <h2> Hola ${ name }</h2>
        <p> ${ msg }</p>
    
        <a
            href="${process.env.HOST}api/auth/changuePassword/${ token }"
            target="_blank"
            > ${ link }</a>
    </div>
    `
    }
