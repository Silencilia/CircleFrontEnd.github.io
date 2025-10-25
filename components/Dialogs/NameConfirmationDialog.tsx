import React, { useMemo, useState } from 'react';
import { useContacts, Contact } from '../../contexts/ContactContext';
import { CancelButton, ConfirmButton } from '../Button';
import { CONTACT_REFERENCE_STYLES } from '../../utils/contactReference';
import useCardNavigation from '../../hooks/useCardNavigation';
import { useChat } from '../../contexts/ChatContext';

interface ExistingEntry {
	contactId: string;
	contactName: string;
	original: string;
	snippet: string;
}

interface NewEntry {
	name: string;
	snippet: string;
}

interface Props {
	draftId: string;
	existing: ExistingEntry[];
	newOnes: NewEntry[];
}

const NameConfirmationDialog: React.FC<Props> = ({ draftId, existing, newOnes }) => {
	const { state, addContact, updateTemporaryNote } = useContacts();
	const chat = useChat();
	const { openContactDetail } = useCardNavigation({
		openContact: (contact) => {},
	});
	const [locked, setLocked] = useState<null | 'confirm' | 'cancel'>(null);
	const [selectedExisting, setSelectedExisting] = useState<Record<string, boolean>>(() => ({}));
	const [selectedNew, setSelectedNew] = useState<Record<string, boolean>>(() => ({}));

	const toggleExisting = (id: string) => {
		if (locked) return;
		setSelectedExisting((prev) => ({ ...prev, [id]: !prev[id] }));
	};
	const toggleNew = (name: string) => {
		if (locked) return;
		setSelectedNew((prev) => ({ ...prev, [name]: !prev[name] }));
	};

	const onCancel = async () => {
		if (locked) return;
		setLocked('cancel');
		try {
			await chat.addSystemText("Cool. We won’t link any of them to this.");
		} catch {}
	};

	const onConfirm = async () => {
		if (locked) return;
		setLocked('confirm');
		try {
			// Build replacement list: existing + newly created contacts
			const selectedExistingIds = existing.filter(e => selectedExisting[e.contactId]).map(e => e.contactId);
			const selectedNewNames = newOnes.filter(n => selectedNew[n.name]).map(n => n.name);

			const createdContacts: Contact[] = [];
			for (const name of selectedNewNames) {
				const c = await addContact({
					name,
					occupation_id: undefined,
					organization_id: undefined,
					birth_date: undefined,
					subject_ids: [],
					relationship_ids: [],
					note_ids: [],
					is_trashed: false,
				});
				createdContacts.push(c);
			}

		// Fetch draft, replace text occurrences by name → token
		const draft = state.drafts.find(d => d.id === draftId);
		if (!draft) return;
		let updatedText = draft.text;

		const selectedExistingContacts = existing.filter(e => selectedExisting[e.contactId]);
		for (const e of selectedExistingContacts) {
			const pattern = e.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			updatedText = updatedText.replace(new RegExp(pattern, 'gi'), `{{contact:${e.contactId}}}`);
		}
		for (const c of createdContacts) {
			const pattern = c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			updatedText = updatedText.replace(new RegExp(pattern, 'gi'), `{{contact:${c.id}}}`);
		}

		updateTemporaryNote?.(draftId, { text: updatedText });

		// Build summary message with clickable tokens
		const existingTokens = selectedExistingContacts.map(e => `{{contact:${e.contactId}}}`).join(', ');
		const newTokens = createdContacts.map(c => `{{contact:${c.id}}}`).join(', ');
		let summary = 'Very well. You selected these people you know:';
		summary += existingTokens ? `\n${existingTokens}` : '\n(none)';
		summary += '\nYou also met some new friends:';
		summary += newTokens ? `\n${newTokens}` : '\n(none)';
		await chat.addSystemText(summary);

		// Insert draft preview
		await chat.addSystemText('Here is a draft of your new note: Let me know if you want to reorganize them for key information');
		await chat.addSystemComponent('DraftCard', { id: draftId });
		} catch (e) {
			// swallow; dialog remains locked but state should be consistent
		}
	};

	const renderExistingRow = (e: ExistingEntry) => {
		const selected = !!selectedExisting[e.contactId];
		const contact = state.contacts.find(c => c.id === e.contactId);
		return (
			<div key={e.contactId} className={`flex items-center justify-between p-sm rounded-sm ${selected ? 'bg-circle-neutral-variant' : ''} ${locked ? 'opacity-60 pointer-events-none' : ''}`}>
				<div className="flex items-center gap-sm">
					<span className="font-circlebodymedium text-circle-primary opacity-50">{e.snippet}</span>
					<span
						className={CONTACT_REFERENCE_STYLES.base}
						data-contact-ref="true"
						data-contact-id={e.contactId}
						role="button"
						onClick={(ev) => {
							ev.stopPropagation();
							if (contact) openContactDetail(contact, null);
						}}
					>
						{e.contactName}
					</span>
				</div>
				<input type="checkbox" checked={selected} onChange={() => toggleExisting(e.contactId)} />
			</div>
		);
	};

	const renderNewRow = (n: NewEntry) => {
		const selected = !!selectedNew[n.name];
		return (
			<div key={n.name} className={`flex items-center justify-between p-sm rounded-sm ${selected ? 'bg-circle-neutral-variant' : ''} ${locked ? 'opacity-60 pointer-events-none' : ''}`}>
				<div className="flex items-center gap-sm">
					<span className="font-circlebodymedium text-circle-primary opacity-50">{n.snippet}</span>
					<span className="font-circlebodymedium-highlight text-circle-primary">{n.name}</span>
				</div>
				<input type="checkbox" checked={selected} onChange={() => toggleNew(n.name)} />
			</div>
		);
	};

	return (
		<div className="crd-dtl">
			<div className="flex flex-col gap-md">
				<div className="font-circlebodymedium text-circle-primary">Existing contact:</div>
				<div className="flex flex-col gap-xs">
					{existing.map(renderExistingRow)}
				</div>
				<div className="font-circlebodymedium text-circle-primary">Add new contact:</div>
				<div className="flex flex-col gap-xs">
					{newOnes.map(renderNewRow)}
				</div>
				<div className="flex gap-[2px] justify-end">
					<CancelButton
						onClick={onCancel}
						className={locked === 'cancel' ? 'bg-circle-neutral-variant' : ''}
						ariaLabel="Cancel"
					/>
					<ConfirmButton
						onClick={onConfirm}
						className={locked === 'confirm' ? 'bg-circle-neutral-variant' : ''}
						ariaLabel="Confirm"
					/>
				</div>
			</div>
		</div>
	);
};

export default NameConfirmationDialog;


