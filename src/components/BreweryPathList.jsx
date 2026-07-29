import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({ id, index, name }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="path-item" {...attributes} {...listeners}>
      <span className="path-item__number">{index + 1}</span>
      <span className="path-item__name">{name}</span>
      <span className="path-item__handle" aria-hidden="true">
        ⠿
      </span>
    </li>
  )
}

/**
 * @param {{ orderedBreweries: Array<{id: string, name: string}>, onReorder: (ids: string[]) => void }} props
 */
function BreweryPathList({ orderedBreweries, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = orderedBreweries.map((b) => b.id)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className="path-list">
          {orderedBreweries.map((brewery, index) => (
            <SortableItem key={brewery.id} id={brewery.id} index={index} name={brewery.name} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

export default BreweryPathList
