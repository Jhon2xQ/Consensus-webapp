export type PasskeyResult = {
	credentialId: string;
};

export type RegisterOptionsResponse = {
	challenge: string;
	rp: { name: string; id: string };
	user: { id: string; name: string; displayName: string };
	pubKeyCredParams: Array<{ type: 'public-key'; alg: number }>;
	timeout: number;
	attestation: 'none' | 'direct' | 'indirect' | 'enterprise';
	authenticatorSelection: {
		residentKey: 'discouraged' | 'preferred' | 'required';
		userVerification: 'discouraged' | 'preferred' | 'required';
	};
};

export type AuthOptionsResponse = {
	challenge: string;
	timeout: number;
	userVerification: 'discouraged' | 'preferred' | 'required';
	rpId: string;
};
