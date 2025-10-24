
import { AdminInviteCodes } from '../../alpha-testing/code-manage-panel'
import { createMultipleCodes } from '../../alpha-testing/test-code-gen'

export function AdminPanel(){
  return (
    <div>
      <button
        onClick={createMultipleCodes}
      >
        Click me
      </button>
      <>
      <AdminInviteCodes />
      </>
    </div>
    )
}