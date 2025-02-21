import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	userName: string
	password: string
	useAuth: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'This modules controls Kiloview NDI devices. You may need to enable HTTP API access for the user account you are using on the Kiloview device.',
		},
		{
			type: 'static-text',
			id: 'hr1',
			width: 12,
			label: ' ',
			value: '<hr />',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'IP Address',
			width: 6,
			default: '',
			regex: Regex.IP,
		},
		{
			type: 'static-text',
			id: 'hr2',
			width: 12,
			label: ' ',
			value: '<hr />',
		},
		{
			type: 'checkbox',
			id: 'useAuth',
			label: 'Use Authentication',
			width: 6,
			default: true,
		},
		{
			type: 'textinput',
			label: 'Username',
			id: 'userName',
			width: 3,
			default: 'admin',
			isVisible: (configValues) => configValues.useAuth === true,
		},
		{
			type: 'textinput',
			label: 'Password',
			id: 'password',
			width: 3,
			default: 'admin',
			isVisible: (configValues) => configValues.useAuth === true,
		},
	]
}
