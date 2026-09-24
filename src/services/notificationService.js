export function subscribeToNewProfileSubmissions(_onNewProfile, _onError) {
  // Background polling disabled according to global fetch control rules
  return () => {}
}

export function subscribeToNewClientPayments(_onNewPayment, _onError) {
  // Background polling disabled according to global fetch control rules
  return () => {}
}
