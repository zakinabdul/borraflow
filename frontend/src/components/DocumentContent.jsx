import React from 'react'

const DocumentContent = ({ answer, loading }) => {
  return (
    <>
        


           <div
            contentEditable
            className="h-[91vh]  outline-none "
            style={{
              lineHeight: "1.8",
              fontSize: "16px",
            }}
            suppressContentEditableWarning
          >

            
            {loading && (
              <p className='text-gray-400'>Generating documentation...</p>
            )}

           {!loading && answer && (
        <iframe
          title="Document Preview"
          className="w-full min-h-full bg-[#525659]"
          srcDoc={answer}
          sandbox="allow-same-origin"
        />
      )}

            {!loading && !answer && (
              <p className='text-gray-500'>
                Ask something to generate documentation.
              </p>
            )}

          </div>
        
    </>
  )
}

export default DocumentContent