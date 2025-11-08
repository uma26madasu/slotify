import React, { useState, useEffect } from 'react';


// Example component showing various ways to use skeleton loaders
const LoadingExamplePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [data, setData] = useState(null);

  // Simulate staggered loading of different sections
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCardLoading(false);
    }, 1000);
    
    setTimeout(() => {
      setFormLoading(false);
    }, 2000);
    
    setTimeout(() => {
      setTableLoading(false);
      setData({
        cards: [
          { id: 1, title: 'Active Projects', value: 12 },
          { id: 2, title: 'Completed Tasks', value: 48 },
          { id: 3, title: 'Team Members', value: 8 }
        ],
        tableData: [
          { id: 1, name: 'Project Alpha', status: 'Active', progress: '75%' },
          { id: 2, name: 'Project Beta', status: 'Planning', progress: '25%' },
          { id: 3, name: 'Project Gamma', status: 'Completed', progress: '100%' },
          { id: 4, name: 'Project Delta', status: 'On Hold', progress: '50%' }
        ]
      });
      setIsLoading(false);
    }, 3000);
  }, []);

  // Example of selectively loading parts of a page
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardLoading ? (
            <>
              <CardSkeleton height="24" />
              <CardSkeleton height="24" />
              <CardSkeleton height="24" />
            </>
          ) : (
            data && data.cards.map(card => (
              <div key={card.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{card.value}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Quick Action Form</h2>
        {formLoading ? (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <TextSkeleton width="1/4" />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <div className="pt-2">
              <ButtonSkeleton width="1/4" />
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Add New Project</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Projects Overview</h2>
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableLoading ? (
                  <>
                    <TableRowSkeleton columns={4} />
                    <TableRowSkeleton columns={4} />
                    <TableRowSkeleton columns={4} />
                    <TableRowSkeleton columns={4} />
                  </>
                ) : (
                  data && data.tableData.map(project => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${project.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: project.progress }}
                          ></div>
                        </div>
                        <span className="text-xs mt-1">{project.progress}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Demo of individual skeleton components */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Skeleton Component Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Text Skeletons</h3>
            <div className="bg-white p-6 rounded-lg shadow space-y-2">
              <TextSkeleton width="3/4" />
              <TextSkeleton width="full" />
              <TextSkeleton width="2/3" />
              <TextSkeleton width="1/2" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Card & Button Skeletons</h3>
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <CardSkeleton height="24" />
              <div className="flex space-x-4">
                <ButtonSkeleton width="1/3" />
                <ButtonSkeleton width="1/3" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoadingExamplePage;