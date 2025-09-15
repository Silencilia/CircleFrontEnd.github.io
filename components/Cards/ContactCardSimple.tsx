import React, { useEffect, useState } from 'react';
import { Contact, Subject, useContacts } from '../../contexts/ContactContext';
import { SubjectTag, OverflowTag } from '../Tag';
import { formatYyyyMmDdToLong } from '../../data/strings';
import { MenuButton } from '../Button';

interface ContactCardSimpleProps {
	contact: Contact;
	onMenuClick?: () => void;
}

const ContactCardSimple: React.FC<ContactCardSimpleProps> = ({ contact, onMenuClick }) => {
  if (contact.is_trashed) {
		return null;
	}
	const { state } = useContacts();
	const [measuredTagCount, setMeasuredTagCount] = useState(0);
	
	// Look up the actual data using IDs
	const occupation = contact.occupation_id ? state.occupations.find(o => o.id === contact.occupation_id) : null;
	const subjects = contact.subject_ids ? contact.subject_ids.map(id => state.subjects.find(s => s.id === id)).filter(Boolean) as Subject[] : [];

	// Ensure subjects is always an array
	const safeSubjects = Array.isArray(subjects) ? subjects : [];

	// Initialize measuredTagCount when subjects change
	useEffect(() => {
		setMeasuredTagCount(safeSubjects.length);
	}, [safeSubjects]);

	// Calculate how many subjects can fit in the container
	// Container width: w-54 (216px), subject width: w-15 (60px), gap: 4px
	// Container height: h-11 (44px), subject height: h-5 (20px), gap: 4px
	// First row: (216 - 60) / (60 + 4) + 1 = 3 subjects
	// Second row: (216 - 60) / (60 + 4) + 1 = 3 subjects
	// Total: 6 subjects can fit comfortably
	const maxVisibleSubjects = 6;
	const visibleSubjects = safeSubjects.slice(0, maxVisibleSubjects);
	const hiddenCount = safeSubjects.length - maxVisibleSubjects;

	// Format birth date without timezone conversion
  const formatBirthDateFromFields = (birth?: Contact['birth_date']): string => {
		if (!birth || (!birth.year && !birth.month && !birth.day)) return 'no birth date';
		if (birth.year && !birth.month && !birth.day) return `${birth.year}`;
		if (birth.year && birth.month && !birth.day) {
			const months = [
				'January','February','March','April','May','June',
				'July','August','September','October','November','December'
			];
			return `${months[birth.month - 1]}, ${birth.year}`;
		}
		if (birth.year && birth.month && birth.day) {
			const months = [
				'January','February','March','April','May','June',
				'July','August','September','October','November','December'
			];
			return `${months[birth.month - 1]} ${birth.day}, ${birth.year}`;
		}
		return 'no birth date';
	};

	return (
		<div className="w-56 h-fit bg-circle-neutral-variant rounded-xl p-3 flex flex-col gap-3">
			{/* Top row: contact info and menu button */}
			<div className="flex flex-row justify-between items-start w-full">
				{/* Contact Info */}
				<div className="flex flex-col h-fit gap-1 w-[144px]">
					<div className="font-inter font-medium text-base leading-6 text-circle-primary truncate">
						{contact.name}
					</div>
					<div className={`font-inter text-sm leading-5 text-circle-primary truncate h-[20px] ${
						occupation?.title 
							? 'font-normal' 
							: 'font-normal italic opacity-50'
					}`}
					>
						{occupation?.title || 'no occupation'}
					</div>
					<div className={`font-inter text-sm leading-5 text-circle-primary truncate h-[20px] ${
						contact.birth_date && contact.birth_date.year 
							? 'font-normal' 
							: 'font-normal italic opacity-50'
					}`}
					>
						{formatBirthDateFromFields(contact.birth_date)}
					</div>
				</div>
				{/* Menu Button */}
				<MenuButton
					onClick={onMenuClick}
					ariaLabel="Open contact details"
				/>
			</div>
			
			{/* Subjects */}
			<div className="flex flex-row flex-wrap items-start content-start gap-[5px] w-54 h-[45px] overflow-hidden">
				{safeSubjects.length > 0 ? (
					<>
						{visibleSubjects.map((subject: Subject) => (
							<SubjectTag 
								key={subject.id} 
								subject={subject} 
								contactId={contact.id}
								fillColor="bg-[#E76835]"
								className="w-15"
								editable={true}
							/>
						))}
						{hiddenCount > 0 && (
							<OverflowTag 
								count={hiddenCount} 
								fillColor="bg-[#E76835]"
								className="w-15"
							/>
						)}
					</>
				) : (
					<div className="text-xs text-gray-400 italic">
						No subjects assigned
					</div>
				)}
			</div>
		</div>
	);
};

export default ContactCardSimple;
