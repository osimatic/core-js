import { WebRTC } from '../web_rtc.js';

describe('WebRTC', () => {
	let mockPeerConnection;
	let mockSignalingBus;
	let mockStream;
	let mockTrack;
	let consoleErrorSpy;

	beforeEach(() => {
		// Mock crypto module
		jest.mock('crypto', () => ({
			createHmac: jest.fn(() => ({
				setEncoding: jest.fn(),
				write: jest.fn(),
				end: jest.fn(),
				read: jest.fn(() => 'mock-password-hash')
			}))
		}));

		// Mock track
		mockTrack = {
			kind: 'video',
			id: 'track-1'
		};

		// Mock stream
		mockStream = {
			getTracks: jest.fn(() => [mockTrack])
		};

		// Mock RTCPeerConnection
		mockPeerConnection = {
			localDescription: { type: 'offer', sdp: 'mock-sdp' },
			connectionState: 'connected',
			signalingState: 'stable',
			onconnectionstatechange: null,
			onicecandidate: null,
			ontrack: null,
			oniceconnectionstatechange: null,
			onicecandidateerror: null,
			addTrack: jest.fn(),
			createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'offer-sdp' }),
			createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'answer-sdp' }),
			setLocalDescription: jest.fn().mockResolvedValue(undefined),
			setRemoteDescription: jest.fn().mockResolvedValue(undefined),
			addIceCandidate: jest.fn().mockResolvedValue(undefined),
			getSenders: jest.fn(() => [{ track: mockTrack }]),
			removeTrack: jest.fn(),
			close: jest.fn()
		};

		global.RTCPeerConnection = jest.fn(() => mockPeerConnection);
		global.RTCSessionDescription = jest.fn((desc) => desc);
		global.RTCIceCandidate = jest.fn((candidate) => candidate);

		// Mock signaling bus
		mockSignalingBus = {
			subscribe: jest.fn(),
			publish: jest.fn()
		};

		// Spy on console.error
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

		// Clear static properties
		delete WebRTC.turnUrl;
		delete WebRTC.stunUrl;
		delete WebRTC.turnSecret;
		delete WebRTC.signalingBus;
	});

	afterEach(() => {
		jest.clearAllMocks();
		consoleErrorSpy.mockRestore();
		delete global.RTCPeerConnection;
		delete global.RTCSessionDescription;
		delete global.RTCIceCandidate;
	});

	describe('setIceServers', () => {
		test('should set TURN and STUN URLs', () => {
			const turnUrl = 'turn:turn.example.com:3478';
			const stunUrl = 'stun:stun.example.com:3478';

			WebRTC.setIceServers(turnUrl, stunUrl);

			expect(WebRTC.turnUrl).toBe(turnUrl);
			expect(WebRTC.stunUrl).toBe(stunUrl);
		});
	});

	describe('setTurnSecret', () => {
		test('should set TURN secret', () => {
			const secret = 'my-secret-key';

			WebRTC.setTurnSecret(secret);

			expect(WebRTC.turnSecret).toBe(secret);
		});
	});

	describe('setSignalingBus', () => {
		test('should set signaling bus', () => {
			WebRTC.setSignalingBus(mockSignalingBus);

			expect(WebRTC.signalingBus).toBe(mockSignalingBus);
		});
	});

	describe('offer', () => {
		beforeEach(() => {
			WebRTC.setIceServers('turn:turn.example.com', 'stun:stun.example.com');
			WebRTC.setTurnSecret('secret');
			WebRTC.setSignalingBus(mockSignalingBus);
		});

		test('should create RTCPeerConnection with correct configuration', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(global.RTCPeerConnection).toHaveBeenCalledWith({
				iceServers: [
					{
						urls: ['turn:turn.example.com?transport=udp', 'turn:turn.example.com?transport=tcp'],
						username: expect.any(String),
						credential: expect.any(String)
					},
					{
						urls: 'stun:stun.example.com'
					}
				]
			});
		});

		test('should add stream tracks to peer connection', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockStream.getTracks).toHaveBeenCalled();
			expect(mockPeerConnection.addTrack).toHaveBeenCalledWith(mockTrack, mockStream);
		});

		test('should create and set local description', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockPeerConnection.createOffer).toHaveBeenCalled();
			expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
		});

		test('should set up connection state change callback', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockPeerConnection.onconnectionstatechange).toBeDefined();

			// Trigger callback
			const event = { type: 'connectionstatechange' };
			mockPeerConnection.onconnectionstatechange(event);

			expect(connectionStateCallback).toHaveBeenCalledWith(event, 'connected');
		});

		test('should set up ice candidate callback', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockPeerConnection.onicecandidate).toBeDefined();

			// Trigger callback
			const event = { candidate: { candidate: 'mock-candidate' } };
			mockPeerConnection.onicecandidate(event);

			expect(iceCandidateCallback).toHaveBeenCalledWith(event);
		});

		test('should subscribe to answer event', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockSignalingBus.subscribe).toHaveBeenCalledWith('answer', expect.any(Function));
		});

		test('should subscribe to candidate event', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockSignalingBus.subscribe).toHaveBeenCalledWith('candidate', expect.any(Function));
		});

		test('should publish offer', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(mockSignalingBus.publish).toHaveBeenCalledWith('offer', {
				id: 'broadcaster-1',
				description: mockPeerConnection.localDescription
			});
		});

		test('should resolve with peer connection', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			const result = await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			expect(result).toBe(mockPeerConnection);
		});

		test('should handle errors and reject', async () => {
			const error = new Error('Connection failed');
			mockPeerConnection.createOffer.mockRejectedValue(error);

			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await expect(
				WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback)
			).rejects.toThrow('Connection failed');

			expect(consoleErrorSpy).toHaveBeenCalledWith(error);
		});

		test('should handle remote description through answer subscription', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			// Get the answer callback
			const answerCallback = mockSignalingBus.subscribe.mock.calls.find(call => call[0] === 'answer')[1];

			// Trigger the callback
			const answerPayload = { description: { type: 'answer', sdp: 'answer-sdp' } };
			answerCallback(answerPayload);

			expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith(answerPayload.description);
		});

		test('should handle ice candidate through candidate subscription', async () => {
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.offer('broadcaster-1', mockStream, iceCandidateCallback, connectionStateCallback);

			// Get the candidate callback
			const candidateCallback = mockSignalingBus.subscribe.mock.calls.find(call => call[0] === 'candidate')[1];

			// Trigger the callback
			const candidatePayload = { candidate: { candidate: 'ice-candidate' } };
			candidateCallback(candidatePayload);

			expect(mockPeerConnection.addIceCandidate).toHaveBeenCalled();
		});
	});

	describe('answer', () => {
		beforeEach(() => {
			WebRTC.setIceServers('turn:turn.example.com', 'stun:stun.example.com');
			WebRTC.setTurnSecret('secret');
			WebRTC.setSignalingBus(mockSignalingBus);
		});

		test('should create RTCPeerConnection with correct configuration', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(global.RTCPeerConnection).toHaveBeenCalled();
		});

		test('should set remote description', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
		});

		test('should create and set local description', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(mockPeerConnection.createAnswer).toHaveBeenCalled();
			expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
		});

		test('should set up ontrack callback', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(mockPeerConnection.ontrack).toBeDefined();

			// Trigger callback
			const event = { streams: [mockStream] };
			mockPeerConnection.ontrack(event);

			expect(onTrackCallback).toHaveBeenCalledWith([mockStream]);
		});

		test('should subscribe to candidate event', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(mockSignalingBus.subscribe).toHaveBeenCalledWith('candidate', expect.any(Function));
		});

		test('should publish answer', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(mockSignalingBus.publish).toHaveBeenCalledWith('answer', {
				id: 'broadcaster-1',
				description: mockPeerConnection.localDescription
			});
		});

		test('should resolve with peer connection', async () => {
			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			const result = await WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback);

			expect(result).toBe(mockPeerConnection);
		});

		test('should handle errors and reject', async () => {
			const error = new Error('Answer failed');
			mockPeerConnection.createAnswer.mockRejectedValue(error);

			const remoteDescription = { type: 'offer', sdp: 'remote-sdp' };
			const onTrackCallback = jest.fn();
			const iceCandidateCallback = jest.fn();
			const connectionStateCallback = jest.fn();

			await expect(
				WebRTC.answer('broadcaster-1', remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateCallback)
			).rejects.toThrow('Answer failed');

			expect(consoleErrorSpy).toHaveBeenCalledWith(error);
		});
	});

	describe('disconnectPeer', () => {
		test('should clear event handlers', () => {
			const result = WebRTC.disconnectPeer(mockPeerConnection);

			expect(mockPeerConnection.oniceconnectionstatechange).toBeNull();
			expect(mockPeerConnection.onicecandidateerror).toBeNull();
			expect(mockPeerConnection.onicecandidate).toBeNull();
			expect(mockPeerConnection.ontrack).toBeNull();
		});

		test('should remove tracks when signaling state is not closed', () => {
			mockPeerConnection.signalingState = 'stable';

			WebRTC.disconnectPeer(mockPeerConnection);

			expect(mockPeerConnection.getSenders).toHaveBeenCalled();
			expect(mockPeerConnection.removeTrack).toHaveBeenCalled();
		});

		test('should close peer connection when signaling state is not closed', () => {
			mockPeerConnection.signalingState = 'stable';

			WebRTC.disconnectPeer(mockPeerConnection);

			expect(mockPeerConnection.close).toHaveBeenCalled();
		});

		test('should not close peer connection when signaling state is closed', () => {
			mockPeerConnection.signalingState = 'closed';

			WebRTC.disconnectPeer(mockPeerConnection);

			expect(mockPeerConnection.close).not.toHaveBeenCalled();
		});

		test('should return null', () => {
			const result = WebRTC.disconnectPeer(mockPeerConnection);

			expect(result).toBeNull();
		});

		test('should handle null peer connection', () => {
			const result = WebRTC.disconnectPeer(null);

			expect(result).toBeNull();
		});

		test('should handle undefined peer connection', () => {
			const result = WebRTC.disconnectPeer(undefined);

			expect(result).toBeUndefined();
		});
	});

	describe('getTurnCredentials', () => {
		test('should generate username based on timestamp', () => {
			WebRTC.setTurnSecret('test-secret');

			const credentials = WebRTC.getTurnCredentials();

			expect(credentials.username).toMatch(/^\d+$/);
			expect(parseInt(credentials.username)).toBeGreaterThan(0);
		});

		test('should generate password using HMAC', () => {
			WebRTC.setTurnSecret('test-secret');

			const credentials = WebRTC.getTurnCredentials();

			expect(credentials.password).toBeDefined();
			expect(typeof credentials.password).toBe('string');
		});
	});
});