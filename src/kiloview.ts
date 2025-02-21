import axios from 'axios'

class KiloviewDecoders {
	useAuth: boolean
	username: string
	password: string
	token: string = ''
	baseURL: string
	alias = ''
	authorized: boolean = false

	constructor(ip: string, useAuth: boolean, username: string, password: string) {
		this.baseURL = `http://${ip}/api`
		this.useAuth = useAuth
		this.username = username
		this.password = password

		if (!useAuth) this.authorized = true
	}

	async authorize(): Promise<void> {
		const params = new URLSearchParams()
		params.append('user', this.username)
		params.append('password', this.password)

		const request = await axios.get(`${this.baseURL}/users/login.json`, {
			params: params, // `params` 객체가 URL에 자동으로 추가됩니다.
		})
		const result = request.data
		console.log(result)

		if (result && result.result === 'error') {
			const error = new Error(result.msg)
			error.name = 'KiloviewDecodersError'
			throw error
		}

		this.alias = result.data.alias
		this.authorized = true
	}

	async fetchData(url: string, params: any = undefined): Promise<any> {
		const endPoint = new URL(url, this.baseURL)

		if (!this.authorized) {
			await this.authorize()
		}

		const headers: any = {}

		if (this.useAuth && this.token) {
			headers['API-Token'] = this.token
		}

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				endPoint.searchParams.append(key, String(value))
			})
		}

		const request = await axios.get(endPoint.toString(), {
			headers: headers,
		})

		const result: any = request.data
		if (result && result.result === 'auth-failed') {
			await this.authorize()
			return this.fetchData(url, params)
		} else {
			if (result && result.result === 'error') {
				const error = new Error(result.msg)
				error.name = 'KiloviewDecoderError'
				throw error
			}

			return result
		}
	}

	async getSourceList(): Promise<any> {
		return this.fetchData('source/get.json')
	}

	async getOutputInfo(output: string): Promise<any> {
		return this.fetchData('/output/get.json', { output })
	}

	async controlOutputInterface(action: string, output: string, source: string): Promise<any> {
		const params: Record<string, any> = {
			output,
			action,
			position: '1',
		}

		if (action === 'set') params.stream_id = source

		return this.fetchData('/output/layout.json', params)
	}

	async setOutputBindPort(output: string, id: string, enable: string): Promise<any> {
		return this.fetchData('/output/bind_port.json', { output, id, enable })
	}

	async sysReboot(): Promise<any> {
		return this.fetchData('/sys/reboot.json')
	}
}

export default KiloviewDecoders
