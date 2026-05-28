export type PasskeyResult = {
	credentialId: string;
};

export type RegisterOptions = {
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

export type AuthOptions = {
	challenge: string;
	timeout: number;
	userVerification: 'discouraged' | 'preferred' | 'required';
	rpId: string;
};
