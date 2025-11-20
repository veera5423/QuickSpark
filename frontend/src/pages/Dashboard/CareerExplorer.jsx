import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { careerAPI } from '../../api/careerAPI';
import { quizAPI } from '../../api/quizAPI';
import QuizModal from '../../components/QuizModal';

const CareerExplorer = () => {
  const [careerRoles, setCareerRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSkillForConfirm, setSelectedSkillForConfirm] = useState(null);
  const [completedSkills, setCompletedSkills] = useState([]);

  useEffect(() => {
    loadCareerRoles();
    loadCompletedSkills();
  }, []);

  // --- API Handlers (Unchanged Logic) ---

  const loadCareerRoles = async () => {
    try {
      setLoading(true);
      const data = await careerAPI.getCareerRoles();
      setCareerRoles(data);
    } catch (error) {
      console.error('Failed to load career roles:', error);
      setError('Failed to load career roles');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedSkills = async () => {
    try {
      const data = await quizAPI.getCompletedSkills();
      // Assuming data.completed_skill_ids is an array of IDs
      setCompletedSkills(data.completed_skill_ids || []);
    } catch (error) {
      console.error('Failed to load completed skills:', error);
    }
  };

  const loadRoleDetails = async (roleId) => {
    try {
      // Set loading state for detail view if necessary
      const data = await careerAPI.getCareerRoleDetails(roleId);
      setSelectedRole(data);
    } catch (error) {
      console.error('Failed to load role details:', error);
      setError('Failed to load role details');
    }
  };

  // --- UI Logic Handlers ---

  const handleMarkAsCompleted = (skill) => {
    setSelectedSkillForConfirm(skill);
    setShowConfirmDialog(true);
  };

  const handleTakeTest = (skill) => {
    setSelectedSkill(skill);
    setShowQuizModal(true);
    setShowConfirmDialog(false);
    setSelectedSkillForConfirm(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setSelectedSkillForConfirm(null);
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setSelectedSkill(null);
    loadCompletedSkills(); // Refresh completed skills after quiz
  };

  const isSkillCompleted = (skillId) => {
    return completedSkills.includes(skillId);
  };

  // --- Render Loading/Error States ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold text-blue-600">Exploring career paths...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-300 rounded-lg">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Button onClick={loadCareerRoles} className="mt-4 bg-red-500 hover:bg-red-700">
          Try Again
        </Button>
      </div>
    );
  }

  // --- Render Component UI ---

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-3">
        Career Explorer 🗺️
      </h1>

      {!selectedRole ? (
        // --- Role Selection View (Grid) ---
        <div>
          <p className="text-lg text-gray-600 mb-8">
            Select a career path to view its required skills and test your readiness.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {careerRoles.map((role) => (
              <Card
                key={role._id}
                className="p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => loadRoleDetails(role._id)}
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.role_name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 h-14">{role.description}</p>
                </div>
                <div>
                  {role.avg_salary && (
                    <p className="text-xl font-extrabold text-green-600 mt-2 mb-4">
                      {role.avg_salary}
                      <span className="text-sm font-medium text-gray-500 ml-1">Avg Salary</span>
                    </p>
                  )}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Explore Path Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // --- Role Details View (Skills Tracker) ---
        <div>
          <Button
            onClick={() => setSelectedRole(null)}
            className="mb-6 bg-gray-600 text-gray-700 hover:bg-gray-400 border border-gray-300 cursor-pointer"
          >
            ← Back to All Roles
          </Button>

          <Card className="shadow-2xl p-8 bg-white border border-blue-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedRole.role_name}</h2>
            <p className="text-gray-600 mb-4 border-b pb-4">{selectedRole.description}</p>
            
            <div className="flex flex-wrap items-center justify-between mb-8 pt-4">
                {selectedRole.avg_salary && (
                    <div className="text-xl font-extrabold text-green-700 p-2 bg-green-50 rounded-lg">
                        💰 Average Salary: {selectedRole.avg_salary}
                    </div>
                )}
                <div className="text-md font-semibold text-purple-600 p-2 bg-purple-50 rounded-lg">
                    {completedSkills.filter(id => selectedRole.skills.map(s => s._id).includes(id)).length} / {selectedRole.skills.length} Skills Mastered
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-5 text-gray-800">Required Skills Roadmap</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedRole.skills.map((skill) => {
                const completed = isSkillCompleted(skill._id);
                const buttonText = completed ? 'Skill Mastered!' : 'Take Assessment';
                const buttonHandler = completed ? null : () => handleMarkAsCompleted(skill);

                return (
                  <div 
                    key={skill._id} 
                    className={`border-l-4 rounded-r-lg p-5 transition-all duration-300 shadow-md ${
                      completed 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-white border-blue-400 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg text-gray-900">{skill.skill_name}</h4>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{skill.category}</span>
                    </div>
                    
                    <Button
                      onClick={buttonHandler}
                      size="sm"
                      className={`w-full text-base h-10 ${
                        completed
                          ? 'bg-green-600 cursor-default hover:bg-green-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      disabled={completed}
                    >
                      {completed ? (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">🏆</span> {buttonText}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">📝</span> {buttonText}
                        </span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && selectedSkill && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={handleCloseQuiz}
          skill={selectedSkill}
        />
      )}

      {/* Confirmation Dialog (Modal enhancement) */}
      {showConfirmDialog && selectedSkillForConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
              <span className="text-yellow-500 mr-2 text-3xl">⚠️</span> Take Assessment
            </h3>
            <p className="text-gray-600 mb-6">
              To officially mark **{selectedSkillForConfirm.skill_name}** as completed, you must pass the assessment test. Are you ready to begin?
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleCancelConfirm}
                className="flex-1 bg-gray-500 text-gray-700 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleTakeTest(selectedSkillForConfirm)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Start Test Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerExplorer;