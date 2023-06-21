import React,{useState} from 'react';
import {BrowserRouter as Router,Routes,Route,Link,useLocation} from 'react-router-dom';
import Cookies from 'js-cookie';

var token;
var decode={email:'FAILURE',password:'FAILURE'};

async function cookieCheck(){
    token=Cookies.get('sessionToken');
    if(!token){
        decode={email:'FAILURE',password:'FAILURE'};
        return;
    }
    decode=JSON.parse(token);
    const exists=await emailExists(decode.email);
    if(!exists){
        decode={email:'FAILURE',password:'FAILURE'};
        return;
    }
    else{
        const response=await fetch(`http://localhost:5000/users/${decode.email}`);
        const data=await response.json();
        if(data['password']===decode.password) return;
    }
}

await cookieCheck();

async function emailExists(email){
    const response=await fetch(`http://localhost:5000/users/${email}`);
    const data=await response.json();
    return data['email']!=='FAILURE';
}

async function postData(email,user,pass){
    var data={'email':email,'username':user,'password':pass};
    const response=await fetch('http://localhost:5000/users',{
        method:'POST',
        body:JSON.stringify(data),
        headers:{
            'Content-Type':'application/json'
        }
    })
    const text=await response.text();
    if(text==='FAILURE') return 'FAILURE';
    return 'SUCCESS';
}

async function emailValid(){
    const email=document.getElementById('email').value;

    if(email===''){
        alert('invalid data!');
        return false;
    }

    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var valid=emailRegex.test(email);
    if(!valid){
        alert('email not valid');
        return false;
    }
    return true;
}

async function register(){
    const email=document.getElementById('email').value;
    const user=document.getElementById('user').value;
    const pass=document.getElementById('pass').value;

    var valid=await emailValid(email);
    if(valid){
        const result=await emailExists(email);
        if(!result){
            const final=await postData(email,user,pass);
            const payload={
                email:email,
                password:pass
            };
            const token=JSON.stringify(payload);
            Cookies.set('sessionToken',token,{expires:7,secure:true});
            alert(final);
            window.location.href='/';
        }
        else{
            alert('email already exists');
        }
    }
}

function Register(){
    if(decode.email==='FAILURE'){
        return(
            <div>
                Email <input type='email' id='email'/><br/>
                Username <input type='text' id='user'/><br/>
                Password <input type='password' id='pass'/><br/>
                <button onClick={register}>Registrar</button>
            </div>
        );
    }
    else{
        return(
            <div>Already logged in: {token}</div>
        );
    }
}

async function email_pass(email,pass){
    const response=await fetch(`http://localhost:5000/users/${email}`);
    const data=await response.json();
    console.log(data);
    return data['password']===pass;
}

async function login(){
    const email=document.getElementById('email').value;
    const pass=document.getElementById('pass').value;

    var valid=await emailValid(email);
    if(valid){
        const result=await emailExists(email);
        if(result){
            const final=await email_pass(email,pass);
            if(final){
                const payload={
                    email:email,
                    password:pass
                };
                const token=JSON.stringify(payload);
                Cookies.set('sessionToken',token,{expires:7,secure:true});
                alert('logged in!');
                window.location.href='/';
            }
            else{
                alert('email or password are invalid!');
            }
        }
        else{
            alert('email not registered!');
        }
    }
}

function Login(){
    if(decode.email==='FAILURE'){
        return(
            <div>
                Email <input type='email' id='email'/><br/>
                Password <input type='password' id='pass'/><br/>
                <button onClick={login}>Iniciar sesión</button>
            </div>
        );
    }
    else{
        return(
            <div>
                Already logged in (as {decode.email})
                <br/>
                <Link to='/'>
                    <button>Main Menu</button>
                </Link>
            </div>
        );
    }
}

const importing={decode,Register,Login};

export default importing;