import server from './server';
import io from './socket_server';

io(server);

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log('server started on port ' + PORT);
})

export = server;
