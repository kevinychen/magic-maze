import { Server } from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';
import { Game } from '../lib/game';

const server = Server({ games: [Game] });
const PORT = process.env.PORT;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../../build');
server.app.use(serve(frontEndAppBuildPath))

server.run(parseInt(PORT!), () => {
    server.app.use(
        async (ctx, next) => await serve(frontEndAppBuildPath)(
            Object.assign(ctx, { path: 'index.html' }),
            next
        )
    )
});
