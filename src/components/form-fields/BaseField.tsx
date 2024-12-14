import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Bars3Icon } from '@heroicons/react/24/solid';

export interface BaseFieldProps {
  id: string;
  label: string;
  index: number;
  isSelected?: boolean;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  onSelect?: (id: string) => void;
}

export const BaseField: React.FC<BaseFieldProps> = ({
  id,
  label,
  index,
  isSelected,
  onMove,
  onSelect,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'FIELD',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'FIELD',
    hover(item: { id: string; index: number }) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      onMove?.(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Use dragPreview for the whole component, but drag handle for the grip icon
  dragPreview(drop(ref));

  return (
    <div
      ref={ref}
      onClick={() => onSelect?.(id)}
      className={`
        group relative p-4 rounded-lg border border-gray-200 
        ${isDragging ? 'opacity-50 ring-2 ring-blue-500 shadow-lg' : ''}
        ${isOver ? 'border-blue-500' : ''}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        hover:border-gray-300
        transition-all duration-200
      `}
    >
      <div className="flex items-start gap-3">
        <div
          ref={drag}
          className="mt-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Bars3Icon className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex-1">
          <div className="mb-2 font-medium text-gray-700">
            {label}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseField;
