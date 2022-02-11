# BitBucket and TeamWork Projects notifications bot
> Integrates [Bitbucket's](https://bitbucket.org/) commits with [TeamWork Projects's](https://www.teamwork.com/) task comments

---

## Repository not maintained!

This repo is not maintained anymore, you should look at [ramsalt/bitbucket-notify-teamwork](https://github.com/ramsalt/bitbucket-notify-teamwork) for a maitnained version of this software.

---


This is a simple webhook server which allows to proxy commit info from Bitbucket to TeamWork Project.

## Configuration

You need to provide a few `env` variables:

- `APP_AUTH_TOKEN`

  The `token` parameter used to authenticate the webhook. 

- `TW_API_KEY` 
  
  The API key to communicate with TeamWork Project
  
- `TW_URL` 

  The complete URL of your TeamWork Project instance. It si most likely something like: `https://your_company(.eu).teamwork.com`
  
  If you have custom domain (or subdomain) you should use that as URL, for example: `https://project.my-company.com`
  
- `TW_AUTHOR_ID`

  *Optional* User ID which will be used to post the comments.
  
  **Important:** The API Key must belong to an administrator to be able to post as different user. 

## Getting Started

Getting up and running is as easy as 1, 2, 3.


1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/bb-vs-tw
    npm install
    ```

3. Start your app

    ```
    npm start
    ```

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.
