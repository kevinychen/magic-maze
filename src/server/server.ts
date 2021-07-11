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

// Clean up old matches every day
const { db } = server.app.context;
const day = 24 * 60 * 60 * 1000;
setInterval(() => {
    for (const matchID of (db.listMatches({ where: { updatedBefore: Date.now() - day } }) as string[])) {
        db.wipe(matchID);
    }
}, day);
