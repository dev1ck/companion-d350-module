import { checkSources } from './api.js'
import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		reboot: {
			name: 'Reboot Device',
			options: [],
			callback: (_event) => {
				void self.DEVICE!.sysReboot()
			},
		},
		setSourceOutput: {
			name: 'Control Output Interface',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'action',
					default: 'set',
					choices: [
						{ id: 'set', label: 'SET' },
						{ id: 'remove', label: 'REMOVE' },
					],
				},
				{
					type: 'dropdown',
					label: 'Source',
					id: 'sourceId',
					default: self.CHOICES_SOURCES[0].id,
					choices: self.CHOICES_SOURCES,
					isVisible: (options) => options.action === 'set',
				},
			],
			callback: (event) => {
				const options = event.options
				void self.DEVICE!.controlOutputInterface(String(options.action), String(options.sourceId))
			},
		},

		refreshSources: {
			name: 'Refresh Sources',
			options: [],
			callback: (_event) => {
				void checkSources(self)
			},
		},

		// setOutputBindPort: {
		// 	name: 'Set Output Bind',
		// 	options: [
		// 		{
		// 			type: 'dropdown',
		// 			label: 'Output',
		// 			id: 'outputId',
		// 			default: '1',
		// 			choices: [
		// 				{ id: '1', label: 'Output 1' },
		// 				{ id: '2', label: 'Output 2' },
		// 			],
		// 		},
		// 		{
		// 			type: 'dropdown',
		// 			label: 'HW Output Interface ID',
		// 			id: 'port',
		// 			default: 'HDMI1',
		// 			choices: [
		// 				{ id: 'HDMI1', label: 'HDMI1' },
		// 				{ id: 'HDMI2', label: 'HDMI2' },
		// 				{ id: 'SDI', label: 'SDI' },
		// 			],
		// 		},
		// 		{
		// 			type: 'dropdown',
		// 			label: 'Enable',
		// 			id: 'enable',
		// 			default: '1',
		// 			choices: [
		// 				{ id: '1', label: 'YES' },
		// 				{ id: '0', label: 'NO' },
		// 			],
		// 		},
		// 	],
		// 	callback: (event) => {
		// 		const options = event.options
		// 		void self.DEVICE!.controlOutputInterface(String(options.outputId), String(options.port), String(options.enable))
		// 	},
		// },
	})
}
