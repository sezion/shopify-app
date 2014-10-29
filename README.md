# Sezion app for Shopify

Sezion’s app for Shopify is an embedded app that creates dynamic videos based on information about any products on the Shopify CMS.  Using the Shopify API, the app allows you to select what content you want to incoporate in your custom video.

## Usage

* First, you need a Sezion account. For more details go to [Sezion.com](https://sezion.com) and register.
* Write your `account_id`and `account_secret` in the correct fields and save them. You can find these credentials in the admin page in Sezion.
* Select which products you want videos from.
* Select a video template to use. You'll see examples of videos with each template to give you an idea of what the result will look like.
* Fill out the different dynamic fields of the video with information about your products.
* Create your video(s) and send them to your youtube account. 

 In order to do this, you need first to connect your Youtube account to Sezion and write down the `id`you receive.

# For developers

The app is developed using [Node.js](http://nodejs.org/) for the server-side and [EJS](http://embeddedjs.com/) for client-side.

## Setting up

Before running this project, you need to create a Shopify account and create an app. You can follow the Shopify developer’s [Getting Started](http://docs.shopify.com/api/the-basics/getting-started) guide. When you're creating the app, you will be asked to give the Application Callback URL. In this project we chose to host the app at the URL https://localhost:3000.

    $ node shopify_app.js -c etc/shopify_app_public.conf

The configuration file has the `api_key` and the `secret` for Shopify. More info: http://www.shopify.com/partners/apps

**Note**: Shopify uses HTTPS, so to test it in `localhost` you need certificates or it won't work properly.

## Structure

To start creating videos, first you need templates. `public/scripts` are where the templates' scripts are stored. There is one file for each template. 
The process for creating a new video using the Sezion SDK (in `public/js`) is:

1. Read the script file. It's a `json`.
2. Create the template object and call `TemplateNew`. This returns an `id` that we need later.
3. For every product selected to create a video, validate the dynamic fields and create the video object.
4. Call `TemplateVideoNew` with the `id` mentioned before and the video object. The video is now processed by Sezion and you receive it's id.

## Develop for other CMSs

Almost all the front-end code can be use to develop an app for another platform, not only Shopify. There are specific lines for Shopify which are commented out. 

## Contact

If you have any questions, feel free to contact us at help@sezion.com
