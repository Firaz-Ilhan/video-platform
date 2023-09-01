import {IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

interface FeedbackButtonProps {
  title: string
  className: string
  icon: IconDefinition
  count?: number
  ariaLabel: string
  onClick: () => void
  animationState?: boolean
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  title,
  className,
  icon,
  count,
  ariaLabel,
  onClick,
  animationState = true,
}) => (
  <button
    title={title}
    className={`btn ${className}`}
    onClick={onClick}
    aria-label={ariaLabel}>
    <FontAwesomeIcon icon={icon} bounce={animationState} />
    {count}
  </button>
)
