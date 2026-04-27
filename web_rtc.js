import crypto from 'node:crypto';

class WebRTC {
    static setIceServers(turnUrl, stunUrl) {
        this.turnUrl = turnUrl;
        this.stunUrl = stunUrl;
    }

    static setTurnSecret(turnSecret) {
        this.turnSecret = turnSecret;
    }

    static setSignalingBus(signalingBus) {
        this.signalingBus = signalingBus;
    }

    static offer(videoBroadcasterId, stream, iceCandidateCallback, connectionStateChangeCallback) {
        return new Promise(async (resolve, reject) => {
            try {
                let { username, password } = this.getTurnCredentials(); 
                let peerConn = new RTCPeerConnection({ 
                    iceServers: [{ 
                        urls: [this.turnUrl + '?transport=udp', this.turnUrl + '?transport=tcp'], 
                        username: username, 
                        credential: password 
                    }, { 
                        urls: this.stunUrl 
                    }] 
                });
                
                peerConn.onconnectionstatechange = (event) => connectionStateChangeCallback(event, peerConn.connectionState);
                peerConn.onicecandidate = (event) => iceCandidateCallback(event);

                stream.getTracks().forEach(track => peerConn.addTrack(track, stream));
                await peerConn.setLocalDescription(await peerConn.createOffer()); 
                
                this.signalingBus.subscribe('answer', (payload) => peerConn.setRemoteDescription(payload.description));
                this.signalingBus.subscribe('candidate', (payload) => peerConn.addIceCandidate(new RTCIceCandidate(payload.candidate)));  
                this.signalingBus.publish('offer', { id: videoBroadcasterId, description: peerConn.localDescription }); 

                resolve(peerConn);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    static answer(videoBroadcasterId, remoteDescription, onTrackCallback, iceCandidateCallback, connectionStateChangeCallback) {        
        return new Promise(async (resolve, reject) => {
            try {
                let { username, password } = this.getTurnCredentials();
                let peerConn = new RTCPeerConnection({ 
                    iceServers: [{ 
                        urls: [this.turnUrl + '?transport=udp', this.turnUrl + '?transport=tcp'], 
                        username: username, 
                        credential: password 
                    }, { 
                        urls: this.stunUrl 
                    }] 
                });

                peerConn.onconnectionstatechange = (event) => connectionStateChangeCallback(event, peerConn.connectionState);
                peerConn.onicecandidate = async (event) => iceCandidateCallback(event);
                peerConn.ontrack = (event) => onTrackCallback(event.streams);

                peerConn.setRemoteDescription(new RTCSessionDescription(remoteDescription));
                await peerConn.setLocalDescription(await peerConn.createAnswer());
                
                this.signalingBus.subscribe('candidate', (payload) => peerConn.addIceCandidate(new RTCIceCandidate(payload.candidate)));
                this.signalingBus.publish('answer', { id: videoBroadcasterId, description: peerConn.localDescription });
               
                resolve(peerConn);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    static disconnectPeer(peerConn) {
        if (peerConn) {
            peerConn.oniceconnectionstatechange = null;
            peerConn.onicecandidateerror = null;
            peerConn.onicecandidate = null;
            peerConn.ontrack = null;

            if (peerConn.signalingState != 'closed') {
                peerConn.getSenders().forEach(sender => peerConn.removeTrack(sender));
                peerConn.close();
            }

            peerConn = null;
        }
            
        return peerConn;
    }

    /*
        static-auth credentials
        https://eturnal.net/documentation/
        https://datatracker.ietf.org/doc/html/draft-uberti-behave-turn-rest-00
    */
    static getTurnCredentials() {
        let username = String(parseInt(Date.now() / 1000) + 24 * 3600); //ttl: 24h
        let hmac = crypto.createHmac('sha1', this.turnSecret);

        hmac.setEncoding('base64');
        hmac.write(username);
        hmac.end();

        return { username: username, password: hmac.read() };
    }
}

export { WebRTC };