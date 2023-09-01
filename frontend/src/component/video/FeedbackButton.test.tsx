import {faArrowCircleRight} from '@fortawesome/free-solid-svg-icons'
import {fireEvent, render, screen} from '@testing-library/react'
import {FeedbackButton} from './FeedbackButton'

describe('<FeedbackButton />', () => {
  it('renders correctly with the given props', () => {
    render(
      <FeedbackButton
        title="Test Button"
        className="test-class"
        icon={faArrowCircleRight}
        count={10}
        ariaLabel="Test Aria Label"
        onClick={() => {}}
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveClass('test-class')
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('fires the onClick event when clicked', () => {
    const mockClickHandler = jest.fn()

    render(
      <FeedbackButton
        title="Test Button"
        className="test-class"
        icon={faArrowCircleRight}
        ariaLabel="Test Aria Label"
        onClick={mockClickHandler}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    expect(mockClickHandler).toHaveBeenCalledTimes(1)
  })
})
