import { useEffect } from 'react';

type UseModalClose = (params: {
	containerRef: React.RefObject<HTMLElement>;
	isOpened: boolean;
	setClosed: () => void;
}) => void;

export const useModalClose: UseModalClose = ({
	containerRef,
	isOpened,
	setClosed,
}) => {
	useEffect(() => {
		if (!isOpened) return;

		const handleMousedown = ({ target }: MouseEvent) => {
			if (target instanceof Node && !containerRef.current?.contains(target)) {
				setClosed();
			}
		};

		const handleEscape = ({ key }: KeyboardEvent) => {
			if (key === 'Escape') {
				setClosed();
			}
		};

		window.addEventListener('mousedown', handleMousedown);
		window.addEventListener('keydown', handleEscape);

		return () => {
			window.removeEventListener('mousedown', handleMousedown);
			window.removeEventListener('keydown', handleEscape);
		};
	}, [containerRef, isOpened, setClosed]);
};
