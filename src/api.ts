import { InstanceStatus } from '@companion-module/base'
import KiloviewDecoders from './kiloview.js'
import { ModuleInstance } from './main.js'

interface Source {
	id: string
	label: string
	url?: string
}
export async function InitConnection(self: ModuleInstance): Promise<void> {
	// clearInterval(self.INTERVAL);
	// clearInterval(self.INTERVAL_SOURCES);
	// clearInterval(self.RECONNECT_INTERVAL);

	if (self.config.host && self.config.host !== '') {
		self.updateStatus(InstanceStatus.Connecting)
		self.log('info', `Opening connection to ${self.config.host}`)
		self.DEVICE = new KiloviewDecoders(
			self.config.host,
			self.config.useAuth,
			self.config.userName,
			self.config.password,
		)

		if (!self.config.useAuth) {
			try {
				self.log('info', 'No authentication required. Connecting to device...')
				const result: any = await self.DEVICE.getSourceList()

				if (result && result.result === 'auth-failed') {
					self.log('error', 'Authorization failed. You need username and password.')
					self.updateStatus(InstanceStatus.ConnectionFailure, 'Authorization Failed. See log.')

					return
				}
			} catch (error: any) {
				self.log(error, 'Could not reach device. Retrying in 30 seconds.')
				self.updateStatus(InstanceStatus.ConnectionFailure)
				startReconnectInterval(self)
				return
			}
		} else {
			try {
				self.log('info', 'Attempting to authorize...')
				await self.DEVICE.authorize()
			} catch (error: any) {
				if (error.name === 'KiloviewDecodersError') {
					self.log(error, 'Authorization failed. Check your username and password and try again.')
					self.updateStatus(InstanceStatus.ConnectionFailure, 'Authorization Failed. See log.')
				} else {
					self.log(error, 'Could not reach device. Retrying in 30 seconds.')
					self.updateStatus(InstanceStatus.ConnectionFailure)
					startReconnectInterval(self)
				}
				return
			}
		}

		if (self.DEVICE.authorized) {
			self.log('info', `Connected to Device with user: ${self.DEVICE.alias}`)
			self.updateStatus(InstanceStatus.Ok)
			void checkSources(self)
		} else {
			self.log('error', 'Authorization failed. Check your username and password and try again.')
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Authorization Failed. See log.')
		}
	}
}

function startReconnectInterval(self: ModuleInstance): void {
	self.updateStatus(InstanceStatus.ConnectionFailure, 'Reconnecting')

	if (self.RECONNECT_INTERVAL !== undefined) {
		clearTimeout(self.RECONNECT_INTERVAL)
		self.RECONNECT_INTERVAL = undefined
	}

	self.log('info', 'Attempting to reconnect in 30 seconds...')

	self.RECONNECT_INTERVAL = setTimeout(() => {
		void self.initConnection()
	}, self.RECONNECT_TIME)
}

export async function checkSources(self: ModuleInstance): Promise<void> {
	if (!self.DEVICE) {
		return
	}

	let sourcesArray: Source[] = []

	const sources = await self.DEVICE.getSourceList()
	if (sources && Array.isArray(sources.data)) {
		sources.data.forEach((source: any) => {
			sourcesArray.push({
				id: source.id,
				label: source.name,
			})
		})
	} else {
		sourcesArray = [{ id: 'null', label: '- No sources available -' }]
	}

	if (JSON.stringify(self.CHOICES_SOURCES) !== JSON.stringify(sourcesArray)) {
		self.log('info', 'Sources have changed. Updating Choices.')
		self.CHOICES_SOURCES = sourcesArray
		console.log(self.CHOICES_SOURCES)
		self.updateActions()
	}
}

// export async function checkState(self: ModuleInstance) {

//     if (!self.DEVICE) {
//         return
//     }

//     try {
//         const info = await self.DEVICE.decoderCurrentStatus()
//         self.STATE.info = info

//         //get presets
//         const presets = await self.DEVICE.decoderPresets()
//         //only update if different
//         if (JSON.stringify(self.STATE.presets) !== JSON.stringify(presets)) {
//             self.log('info', 'NDI Presets have changed. Updating Presets...')
//             self.STATE.presets = presets
//             self.initActions()
//             self.initPresets()
//         }
//     } catch (e) {
//         console.log('Error with info: ' + e.message)
//     }

//     try {
//         const server_info = await self.DEVICE.sysServerInfo()
//         self.STATE.server_info = server_info
//     } catch (e) {
//         console.log('Error with server_info: ' + e.message)
//     }

//     self.checkFeedbacks()
//     self.checkVariables()
// }
