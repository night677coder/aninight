import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Input, Textarea, Button } from "@nextui-org/react";
import { toast } from 'sonner';

const statusOptions = [
    { name: "Reading", value: "CURRENT" },
    { name: "Plan to read", value: "PLANNING" },
    { name: "Completed", value: "COMPLETED" },
    { name: "Rereading", value: "REPEATING" },
    { name: "Paused", value: "PAUSED" },
    { name: "Dropped", value: "DROPPED" },
];

function MangaAddToList({ isOpen, onOpenChange, list, chaptersLength, session, id, setList }) {
    const [status, setStatus] = useState(list?.status || '');
    const [score, setScore] = useState(list?.score || 0);
    const [progress, setProgress] = useState(list?.progress || 0);
    const [startDate, setStartDate] = useState(() => {
        if (list?.startedAt) {
            const { year, month, day } = list.startedAt;
            if (year !== null && month !== null && day !== null) {
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        }
        return '';
    });
    const [finishDate, setFinishDate] = useState(() => {
        if (list?.completedAt) {
            const { year, month, day } = list.completedAt;
            if (year !== null && month !== null && day !== null) {
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        }
        return '';
    });
    const [rereads, setRereads] = useState(list?.repeat || 0);
    const [notes, setNotes] = useState(list?.notes || '');

    const extractDateInfo = (dateString) => {
        const dateObj = new Date(dateString);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        return { year, month, day };
    };

    const handleProgressChange = (e) => {
        const newProgress = e.target.value;
        if (chaptersLength && newProgress > chaptersLength) {
            toast.error(`Progress cannot exceed ${chaptersLength} chapters`);
        } else {
            setProgress(newProgress);
        }
    };

    const handleScoreChange = (e) => {
        const newScore = e.target.value;
        if (newScore > 10) {
            toast.error("Score cannot exceed 10");
        } else {
            setScore(newScore);
        }
    };

    const handleSubmit = async () => {
        try {
            const startedAtDateInfo = startDate ? extractDateInfo(startDate) : null;
            const finishAtDateInfo = finishDate ? extractDateInfo(finishDate) : null;

            const response = await fetch("/api/anilist/update-list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mediaId: id,
                    progress: progress || 0,
                    status: status || null,
                    score: score || 0,
                    startedAt: startedAtDateInfo || null,
                    completedAt: finishAtDateInfo || null,
                    repeat: rereads || 0,
                    notes: notes || null,
                }),
            });
            const { data } = await response.json();
            if (data.SaveMediaListEntry === null) {
                toast.error("Something went wrong");
                return;
            }
            const savedEntry = data?.SaveMediaListEntry;
            setList(savedEntry);
            toast.success("Manga list updated");
            onOpenChange(false);
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    };

    const deleteList = async () => {
        try {
            const response = await fetch("/api/anilist/delete-list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: list?.id,
                }),
            });
            const { data } = await response.json();
            if (data.DeleteMediaListEntry?.deleted === true) {
                toast.success("Removed from list");
                setList(null);
                onOpenChange(false);
                return;
            }
            toast.error("Something went wrong");
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            size="2xl"
            classNames={{
                base: "bg-black border border-white/20",
                header: "border-b border-white/10",
                body: "py-6",
                footer: "border-t border-white/10"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-white text-xl font-bold">
                            Manage Manga List
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Select
                                    label="Status"
                                    placeholder="Select status"
                                    selectedKeys={status ? [status] : []}
                                    onChange={(e) => setStatus(e.target.value)}
                                    classNames={{
                                        trigger: "bg-white/5 border-white/10",
                                        label: "text-gray-400",
                                        value: "text-white"
                                    }}
                                >
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Chapters Read"
                                        placeholder="0"
                                        value={progress}
                                        onChange={handleProgressChange}
                                        min="0"
                                        max={chaptersLength || 9999}
                                        classNames={{
                                            input: "text-white",
                                            label: "text-gray-400",
                                            inputWrapper: "bg-white/5 border-white/10"
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        label="Score (0-10)"
                                        placeholder="0"
                                        value={score}
                                        onChange={handleScoreChange}
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        classNames={{
                                            input: "text-white",
                                            label: "text-gray-400",
                                            inputWrapper: "bg-white/5 border-white/10"
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        classNames={{
                                            input: "text-white",
                                            label: "text-gray-400",
                                            inputWrapper: "bg-white/5 border-white/10"
                                        }}
                                    />
                                    <Input
                                        type="date"
                                        label="Finish Date"
                                        value={finishDate}
                                        onChange={(e) => setFinishDate(e.target.value)}
                                        classNames={{
                                            input: "text-white",
                                            label: "text-gray-400",
                                            inputWrapper: "bg-white/5 border-white/10"
                                        }}
                                    />
                                </div>

                                <Input
                                    type="number"
                                    label="Rereads"
                                    placeholder="0"
                                    value={rereads}
                                    onChange={(e) => setRereads(e.target.value)}
                                    min="0"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-gray-400",
                                        inputWrapper: "bg-white/5 border-white/10"
                                    }}
                                />

                                <Textarea
                                    label="Notes"
                                    placeholder="Add your notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    minRows={3}
                                    classNames={{
                                        input: "text-white",
                                        label: "text-gray-400",
                                        inputWrapper: "bg-white/5 border-white/10"
                                    }}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <div className="flex justify-between w-full">
                                {list && (
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={deleteList}
                                    >
                                        Remove from List
                                    </Button>
                                )}
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        variant="flat"
                                        onPress={onClose}
                                        className="bg-white/10 text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-white text-black font-semibold"
                                        onPress={handleSubmit}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default MangaAddToList;
