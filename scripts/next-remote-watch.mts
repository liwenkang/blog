#!/usr/bin/env ts-node

// Adapted from https://github.com/hashicorp/next-remote-watch
// A copy of next-remote-watch with an additional ws reload emitter.
// The app listens to the event and triggers a client-side router refresh
// see components/ClientReload.js

import chalk from 'chalk'
import chokidar from 'chokidar'
import { program } from 'commander'
import http from 'node:http'
import { Server as SocketIO } from 'socket.io'
import express from 'express'
import { spawn } from 'node:child_process'
import next from 'next'
import path from 'node:path'
import { parse } from 'node:url'
import { logger } from './utils/script-logger.js'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))

const defaultWatchEvent = 'change'

program.version(pkg.version)
program
  .option('-r, --root [dir]', 'root directory of your nextjs app')
  .option('-s, --script [path]', 'path to the script you want to trigger on a watcher event', '')
  .option('-c, --command [cmd]', 'command to execute on a watcher event', '')
  .option(
    '-e, --event [name]',
    `name of event to watch, defaults to ${defaultWatchEvent}`,
    defaultWatchEvent
  )
  .option('-p, --polling [name]', `use polling for the watcher, defaults to false`, '')
  .argument('[dirs...]', 'directories to watch')
  .parse(process.argv)

const opts = program.opts()
const shell = process.env.SHELL
const app = next({ dev: true, dir: opts.root || process.cwd() })
const port = parseInt(process.env.PORT || '3000', 10)
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // if directories are provided, watch them for changes and trigger reload
  const watchDirs = program.args || []
  if (watchDirs.length > 0) {
    chokidar
      .watch(watchDirs, { usePolling: Boolean(opts.polling) })
      .on(
        opts.event,
        async (filePathContext: string, eventContext: string = defaultWatchEvent): Promise<void> => {
          // Emit changes via socketio
          io.emit('reload', filePathContext)
          // @ts-ignore - Next.js internal API
          app.server?.hotReloader?.send('building')

          if (opts.command) {
            // Use spawn here so that we can pipe stdio from the command without buffering
            spawn(
              shell || '/bin/sh',
              [
                '-c',
                opts.command
                  .replace(/\{event\}/gi, filePathContext)
                  .replace(/\{path\}/gi, eventContext),
              ],
              {
                stdio: 'inherit',
              }
            )
          }

          if (opts.script) {
            try {
              // find the path of your --script script
              const scriptPath = path.join(process.cwd(), opts.script)

              // require your --script script
              const executeFile = await import(scriptPath)

              // run the exported function from your --script script
              if (typeof executeFile.default === 'function') {
                executeFile.default(filePathContext, eventContext)
              }
            } catch (e) {
              logger.error('Remote script failed', e as Error)
              return
            }
          }

          // @ts-ignore - Next.js internal API
          app.server?.hotReloader?.send('reloadPage')
        }
      )
  }

  // create an express server
  const expressApp = express()
  const server = http.createServer(expressApp)

  // watch files with socketIO
  const io = new SocketIO(server)

  // special handling for mdx reload route
  const reloadRoute = express.Router()
  reloadRoute.use(express.json())
  reloadRoute.all('/', (req, res) => {
    // log message if present
    const msg = req.body.message
    const color = req.body.color as string | undefined
    if (msg) {
      // @ts-ignore - chalk dynamic color access
      logger.info(color && (chalk as any)[color] ? (chalk as any)[color](msg) : msg)
    }

    // reload the nextjs app
    // @ts-ignore - Next.js internal API
    app.server?.hotReloader?.send('building')
    // @ts-ignore - Next.js internal API
    app.server?.hotReloader?.send('reloadPage')
    res.end('Reload initiated')
  })

  expressApp.use('/__next_reload', reloadRoute)

  // handle all other routes with next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res, parse(req.url || '', true))
  })

  // fire it up
  server.listen(port, (err?: Error) => {
    if (err) throw err
    logger.info(`> Ready on http://localhost:${port}`)
  })
})
