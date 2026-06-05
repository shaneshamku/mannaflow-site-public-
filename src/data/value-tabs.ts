export interface ValueTab {
  id: string;
  label: string;
  iconPath: string;
  benefit: string;
  supportingText: string;
}

export const valueTabs: ValueTab[] = [
  {
    id: 'respond',
    label: 'Respond faster',
    iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    benefit: 'Reduce the delay between inquiry and first response.',
    supportingText:
      'The window to respond is short. MannaFlow helps your business acknowledge leads quickly, before they move on.',
  },
  {
    id: 'capture',
    label: 'Capture details',
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    benefit: 'Collect the information your team needs before follow-up.',
    supportingText:
      'MannaFlow organizes contact info, timing, and urgency before your team follows up — so every conversation starts prepared.',
  },
  {
    id: 'book',
    label: 'Book the appointment',
    iconPath:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    benefit: 'Move qualified prospects toward the next step while interest is still high.',
    supportingText:
      'A lead that waits is a lead at risk. MannaFlow helps move prospects toward a booking before the moment passes.',
  },
  {
    id: 'follow',
    label: 'Follow up',
    iconPath:
      'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    benefit: "Keep open opportunities from going cold until they're ready to book.",
    supportingText:
      "Not every lead books on first contact. MannaFlow keeps your business in front of leads that are still deciding.",
  },
];
