# Cornerlunch Backend-Test-Boscan
Basic management system to coordinate the meal delivery for Cornershop employees.

## What you'll need before you get started:
1. You'll need to [install docker](https://www.docker.com/get-started)
2. Clone this repo
````sh
$ git clone https://github.com/dannyboscan/Backend-Test-Boscan.git
````
3. [Create a Slack app](https://github.com/slackapi/python-slackclient/blob/main/tutorial/01-creating-the-slack-app.md), the app created must have the following permissions *chat:write*, *im:write* and *channels:read*
4. Finally copy and save your bot token. You'll need this to setup the app.

## Startup the application

Create and start containers
````sh
$ docker-compose up -d --build
````

Create a admin user
````sh
$ docker-compose exec mealorders python manage.py createsuperuser --username <username> --email <email>
````

Navigate to [http://localhost:3000/](http://localhost:3000/) within your browser of choice to view the client app
and [http://localhost:8000/docs/](http://localhost:8000/docs/) to view the **Cornerlunch API** Docs.


> Don't forget sign in with your admin user credentials


## Application Setup
Navigate to [http://localhost:3000/settings/](http://localhost:3000/settings/) to setup the Slack App with your bot token previously copied and saved, then choose one channel of your preference for notifications.

> Note: If you don't receive the slack message please add the created App to the channel


## Employee view to place a order
> Before place a order, you'll need to create a menu, to do that navigate to [http://localhost:3000/menus/](http://localhost:3000/menus/)

Navigate to http://localhost:3000/menu/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/ (Menu UUID)

## Test 

Run the tests with coverage
````sh
$ docker-compose exec mealorders pytest -p no:warnings --cov=. --cov-report html
````

The HTML version can be viewed within the newly created "htmlcov" directory.
```sh
$ open app/htmlcov/index.html
```

## Stop and remove containers
```sh
$ docker-compose down -v
```
