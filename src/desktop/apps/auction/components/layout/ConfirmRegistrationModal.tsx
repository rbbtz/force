import React, { useEffect, useState } from "react"
import { Modal } from "reaction/Components/Modal/Modal"
import { Serif, Button, CheckCircleIcon, Box } from "@artsy/palette"
import { connect } from "react-redux"

const _ConfirmRegistrationModal = ({ me, modalType, onClose }) => {
  useEffect(() => {
    const replaceModalTriggerPath = location.pathname.replace(
      "/confirm-registration",
      ""
    )
    history.replaceState({}, document.title, replaceModalTriggerPath)
  }, [])
  if (!(me && me.bidders && me.bidders.length)) return null

  const bidder = me.bidders[0]

  const [modalVisible, setModalVisible] = useState(true)

  const hideModal = () => {
    setModalVisible(false)
    onClose()
  }

  let Content
  if (bidder.qualified_for_bidding) {
    Content = RegistrationComplete
  } else {
    Content =
      modalType === "ConfirmBidAndRegistration" ? CantBid : RegistrationPending
  }

  return (
    <Modal show={modalVisible} onClose={hideModal}>
      <Box pt={[3, 0]} textAlign="center">
        <Content onClick={hideModal} />
      </Box>
    </Modal>
  )
}

const CantBid = ({ onClick }) => {
  return (
    <>
      <RegistrationPendingHeader />
      <Serif my={3} size="3t">
        We're sorry, your bid could not be placed.
      </Serif>
      <ReviewingRegistrationContent />
      <ViewWorksButton onClick={onClick} />
    </>
  )
}

const RegistrationPending = ({ onClick }) => {
  return (
    <>
      <RegistrationPendingHeader />
      <ReviewingRegistrationContent />
      <ViewWorksButton onClick={onClick} />
    </>
  )
}
const RegistrationComplete = ({ onClick }) => {
  return (
    <>
      <Serif size="6">Registration complete</Serif>
      <CheckCircleIcon mt={2} height="28px" width="28px" fill="green100" />
      <Serif mt={2} mb={3} size="3t">
        Thank you for registering.
        <br />
        You’re now eligible to bid on lots in this sale.
      </Serif>
      <Button width="100%" onClick={onClick}>
        Start bidding
      </Button>
    </>
  )
}

const mapStateToProps = state => ({
  me: state.app.me,
  modalType: state.app.modalType,
})

export const ConfirmRegistrationModal = connect(mapStateToProps)(
  _ConfirmRegistrationModal
)

const ReviewingRegistrationContent = () => {
  return (
    <Serif my={3} size="3t">
      Artsy is reviewing your registration and you will receive an email when it
      has been confirmed. Please email specialist@artsy.net with any questions.
      <br />
      <br />
      In the meantime, you can still view works and watch lots you’re interested
      in.
    </Serif>
  )
}

const RegistrationPendingHeader = () => {
  return <Serif size="6">Registration pending</Serif>
}

const ViewWorksButton = props => {
  return (
    <Button width="100%" onClick={props.onClick}>
      View works in this sale
    </Button>
  )
}
