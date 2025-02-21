import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { InitConnection } from './api.js'
import KiloviewDecoders from './kiloview.js'

interface source {
	id: string
	label: string
}
export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	DEVICE?: KiloviewDecoders
	RECONNECT_TIME: number = 30000
	CHOICES_SOURCES: source[] = [{ id: 'null', label: '- No sources available -' }]
	RECONNECT_INTERVAL: any = undefined
	// POLLINGRATE: number = 1000
	// POLLINGRATE_SOURCES: number = 10000
	// INTERVAL: null
	// INTERVAL_SOURCES: null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.DEVICE = undefined
		this.updateStatus(InstanceStatus.Ok)

		//await this.initConnection()
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	async initConnection(): Promise<void> {
		await InitConnection(this)
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
