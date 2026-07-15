# NutriSimple

A simple project that solves a problem I've had more than once:
- Needing a unified place to track my calories and find recipes based on my goals. With the bonus of quick weather information for deciding the best time to go for a run.

## Requirements
- Node.js (Version 26.2.0 >=)
- npm
- PostgresQL (Version 18>=)

## Required API Keys:
- PirateWeather key
- GeoAPIfy key
- Spoonacular key



### Docker Install Instructions (recommended)

- ```bash
    $ git clone git@github.com:swampPr/nutri-simple.git
    ```

- **All the necessary secrets are in .env.example file. Add your own keys of the services mentioned above along with all the required information to the .env.example file and then rename the file to .env**
- **Then run the following command with *Docker Compose**:*
    - ```bash
        docker compose up
        ```
- Then open `localhost:8000` in your browser

### Native Install Instructions

- ```bash
    git clone git@github.com:swampPr/nutri-simple.git
    cd nutri-simple
    ```
- ```bash
    npm install
    ```
- **All the necessary secrets are in .env.example file. Add your own keys of the services mentioned above to the .env.example file and then rename the file to .env**
- **Create the Database**
    - `CREATE DATABASE nutrisimple;`
- **Build**
    - ```bash
        npm run build
        npm run build:front
        ```
- **Start (Pick one)**
    - ```bash
        # development mode
        npm run start

        # watch mode
        npm run start:dev

        # production mode
        npm run start:prod
        ```
### Built with NestJS 
